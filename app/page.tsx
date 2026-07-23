'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { CodeEditor } from '@/components/code-editor'
import { RegisterView } from '@/components/register-view'
import { MemoryView } from '@/components/memory-view'
import { MachineCodeView } from '@/components/machine-code-view'
import { IOView } from '@/components/io-view'
import { InstructionReference } from '@/components/instruction-reference'
import { SimulatorToolbar } from '@/components/simulator-toolbar'
import { ExportDialog } from '@/components/export-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { assemble, type AssemblerResult } from '@/lib/assembler-8085'
import { CPU8085, type CPUState } from '@/lib/cpu-8085'
import { getExamples } from '@/lib/examples-8085'
import { generatePDF, downloadBlob, type ExecutionStep } from '@/lib/pdf-generator'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { open, save } from '@tauri-apps/plugin-dialog'
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'
import { useLanguage } from '@/lib/i18n'

export default function SimulatorPage() {
  const { t, locale } = useLanguage()
  const { toast } = useToast()
  const cpuRef = useRef<CPU8085 | null>(null)
  
  const [code, setCode] = useState(getExamples('es')[0].code)
  const [selectedExampleIdx, setSelectedExampleIdx] = useState<number>(0)
  const [assemblerResult, setAssemblerResult] = useState<AssemblerResult | null>(null)
  const [cpuState, setCpuState] = useState<CPUState | null>(null)
  const [memory, setMemory] = useState<Uint8Array>(new Uint8Array(65536))
  const [outputPorts, setOutputPorts] = useState<Record<number, number>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [currentLine, setCurrentLine] = useState<number | undefined>(undefined)
  const [hasStepped, setHasStepped] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const runIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    cpuRef.current = new CPU8085()
    setCpuState(cpuRef.current.getState())
    setMemory(cpuRef.current.getMemory())
  }, [])

  useEffect(() => {
    setCode(getExamples(locale)[selectedExampleIdx].code)
  }, [locale, selectedExampleIdx])

  const handleAssemble = useCallback(() => {
    const result = assemble(code, locale)
    setAssemblerResult(result)

    if (result.success) {
      setHasStepped(false)
      if (cpuRef.current) {
        cpuRef.current.reset()
        cpuRef.current.loadProgram(result.machineCode, result.startAddress)
        cpuRef.current.setPC(result.startAddress)
        setCpuState(cpuRef.current.getState())
        setMemory(new Uint8Array(cpuRef.current.getMemory()))
      }

      toast({
        title: t('page.assembleSuccess'),
        description: t('page.assembleSuccessDesc', result.machineCode.length),
      })

      // Find the line for the current PC
      const currentInstruction = result.instructions.find(
        inst => inst.address === result.startAddress
      )
      if (currentInstruction) {
        setCurrentLine(currentInstruction.line)
      }
    } else {
      toast({
        title: t('page.assembleFailed'),
        description: t('page.assembleFailedDesc', result.errors.length),
        variant: 'destructive',
      })
    }
  }, [code, toast, t, locale])

  const updateCurrentLine = useCallback(() => {
    if (!cpuRef.current || !assemblerResult) return

    const pc = cpuRef.current.getState().PC
    const currentInstruction = assemblerResult.instructions.find(
      inst => inst.address === pc
    )
    if (currentInstruction) {
      setCurrentLine(currentInstruction.line)
    }
  }, [assemblerResult])

  const handleStep = useCallback(() => {
    if (!cpuRef.current || !assemblerResult) return

    const result = cpuRef.current.step()
    setCpuState(cpuRef.current.getState())
    setMemory(new Uint8Array(cpuRef.current.getMemory()))
    setHasStepped(true)
    setOutputPorts(cpuRef.current.getOutputPorts())
    updateCurrentLine()

    if (!result.success) {
      toast({
        title: t('page.runError'),
        description: result.error,
        variant: 'destructive',
      })
    }

    if (cpuRef.current.getState().halted) {
      toast({
        title: t('page.programHalted'),
        description: t('page.programHaltedDesc'),
      })
    }
  }, [assemblerResult, toast, updateCurrentLine, t])

  const handleRun = useCallback(() => {
    if (!cpuRef.current || isRunning) return

    setIsRunning(true)

    runIntervalRef.current = setInterval(() => {
      if (!cpuRef.current) return

      const result = cpuRef.current.step()
      setCpuState(cpuRef.current.getState())
      setMemory(new Uint8Array(cpuRef.current.getMemory()))
      setOutputPorts(cpuRef.current.getOutputPorts())
      updateCurrentLine()

      if (!result.success || cpuRef.current.getState().halted) {
        if (runIntervalRef.current) {
          clearInterval(runIntervalRef.current)
          runIntervalRef.current = null
        }
        setIsRunning(false)

        if (!result.success) {
          toast({
            title: t('page.runError'),
            description: result.error,
            variant: 'destructive',
          })
        } else {
          toast({
            title: t('page.programHalted'),
            description: t('page.executionComplete'),
          })
        }
      }
    }, 50)
  }, [isRunning, toast, updateCurrentLine, t])

  const handleStop = useCallback(() => {
    if (runIntervalRef.current) {
      clearInterval(runIntervalRef.current)
      runIntervalRef.current = null
    }
    setIsRunning(false)
  }, [])

  const handleReset = useCallback(() => {
    handleStop()
    setHasStepped(false)

    if (cpuRef.current) {
      cpuRef.current.reset()
      
      // Reload program if assembled
      if (assemblerResult?.success) {
        cpuRef.current.loadProgram(assemblerResult.machineCode, assemblerResult.startAddress)
        cpuRef.current.setPC(assemblerResult.startAddress)
      }
      
      setCpuState(cpuRef.current.getState())
      setMemory(new Uint8Array(cpuRef.current.getMemory()))
      setOutputPorts({})
      updateCurrentLine()
    }
  }, [assemblerResult, handleStop, updateCurrentLine])

  const handleSetInputPort = useCallback((port: number, value: number) => {
    if (cpuRef.current) {
      cpuRef.current.setInputPort(port, value)
    }
  }, [])

  const handleMemoryChange = useCallback((address: number, value: number) => {
    if (cpuRef.current) {
      cpuRef.current.writeMemory(address, value)
      setMemory(new Uint8Array(cpuRef.current.getMemory()))
    }
  }, [])

  const handleSave = useCallback(async () => {
    const path = await save({
      filters: [{ name: 'Assembly', extensions: ['asm'] }],
      defaultPath: 'program.asm',
    })
    if (path) {
      await writeTextFile(path, code)
    }
  }, [code])

  const buildExecutionSteps = useCallback((): { steps: ExecutionStep[]; relevantMemory: { address: number; value: number }[] } => {
    if (!assemblerResult?.success || !cpuRef.current) return { steps: [], relevantMemory: [] }

    const cpu = cpuRef.current
    const savedPC = cpu.getState().PC

    cpu.reset()
    cpu.loadProgram(assemblerResult.machineCode, assemblerResult.startAddress)
    cpu.setPC(assemblerResult.startAddress)

    const steps: ExecutionStep[] = []
    let stepNum = 0

    while (!cpu.getState().halted && stepNum < 1000) {
      const currentPc = cpu.getState().PC
      const currentInst = assemblerResult.instructions.find(
        inst => inst.address === currentPc
      )
      const result = cpu.step()
      if (!result.success) break
      stepNum++

      const instIndex = assemblerResult.instructions.findIndex(
        inst => inst.address === currentPc
      )
      steps.push({
        stepNumber: stepNum,
        instructionNumber: instIndex >= 0 ? instIndex + 1 : 0,
        instruction: currentInst?.instruction ?? '?',
        address: currentPc,
        state: cpu.getState(),
        mValue: cpu.readMemory(cpu.getHL()),
      })
    }

    const memAddresses = new Set<number>()
    for (const inst of assemblerResult.instructions) {
      const m = inst.instruction.match(/^(LDA|STA|LHLD|SHLD)\s+([0-9A-Fa-f]+)[hH]?$/)
      if (m) {
        const addr = parseInt(m[2], 16)
        memAddresses.add(addr)
        memAddresses.add(addr + 1)
      }
    }
    const relevantMemory = Array.from(memAddresses).sort().map(addr => ({
      address: addr,
      value: cpu.readMemory(addr),
    }))

    // Restore saved PC
    cpu.reset()
    cpu.loadProgram(assemblerResult.machineCode, assemblerResult.startAddress)
    cpu.setPC(savedPC)

    return { steps, relevantMemory }
  }, [assemblerResult])

  const handleExport = useCallback(() => {
    if (!assemblerResult?.success) return
    setDialogOpen(true)
  }, [assemblerResult])

  const handleExportOnlyTemplate = useCallback(async () => {
    if (!assemblerResult?.success) return
    try {
      const blob = generatePDF(assemblerResult.instructions, [], [], studentName.trim() || t('page.unnamed'), '1', '1', locale)
      await downloadBlob(blob, 'Plantilla_Ejercicio.pdf')
      setDialogOpen(false)
      toast({ title: t('page.exported'), description: t('page.templateGenerated') })
    } catch (e) {
      console.error('Export error (template only):', e)
      toast({ title: t('page.error'), description: t('page.templateFailed'), variant: 'destructive' })
    }
  }, [assemblerResult, studentName, toast, t, locale])

  const handleExportFull = useCallback(async () => {
    if (!assemblerResult?.success || !cpuRef.current) return

    try {
      const { steps, relevantMemory } = buildExecutionSteps()
      const blob = generatePDF(assemblerResult.instructions, steps, relevantMemory, studentName.trim() || t('page.unnamed'), '1', '1', locale)
      await downloadBlob(blob, 'Prueba_Escritorio_Ejercicio.pdf')
      setDialogOpen(false)
      toast({ title: t('page.exported'), description: t('page.pdfGenerated') })
    } catch (e) {
      console.error('Export error (full):', e)
    }
  }, [assemblerResult, studentName, buildExecutionSteps, toast, t, locale])

  const handleLoad = useCallback(async () => {
    const path = await open({
      filters: [{ name: 'Assembly', extensions: ['asm', 'txt'] }],
      multiple: false,
    })
    if (path) {
      const content = await readTextFile(path as string)
      setCode(content)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey

      if (e.key === 'F5') {
        e.preventDefault()
        if (assemblerResult?.success && !isRunning) handleRun()
      } else if (e.key === 'F10') {
        e.preventDefault()
        if (assemblerResult?.success && !isRunning) handleStep()
      } else if (e.key === 'F7' || (isCtrl && e.shiftKey && e.key === 'A')) {
        e.preventDefault()
        handleAssemble()
      } else if (isCtrl && e.shiftKey && e.key === 'R') {
        e.preventDefault()
        handleReset()
      } else if (isCtrl && e.key === 's') {
        e.preventDefault()
        handleSave()
      } else if (isCtrl && e.key === 'o') {
        e.preventDefault()
        handleLoad()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [assemblerResult, isRunning, handleAssemble, handleRun, handleStep, handleReset, handleSave, handleLoad])

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <SimulatorToolbar
        onAssemble={handleAssemble}
        onRun={handleRun}
        onStep={handleStep}
        onStop={handleStop}
        onReset={handleReset}
        onLoad={handleLoad}
        onSave={handleSave}
        onExport={handleExport}
        isRunning={isRunning}
        isAssembled={assemblerResult?.success ?? false}
      />

      <ExportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        hasStepped={hasStepped}
        studentName={studentName}
        onStudentNameChange={setStudentName}
        onExportOnlyTemplate={handleExportOnlyTemplate}
        onExportFull={handleExportFull}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Code Editor */}
        <div className="flex w-1/2 flex-col border-r border-border">
          <div className="flex-shrink-0 border-b border-border px-4 py-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-muted-foreground">{t('page.codeEditorTitle')}</h2>
              <Select
                key={locale}
                value=""
                onValueChange={(value) => {
                  const idx = parseInt(value, 10)
                  if (!isNaN(idx) && getExamples(locale)[idx]) {
                    setSelectedExampleIdx(idx)
                    setCode(getExamples(locale)[idx].code)
                  }
                }}
              >
                <SelectTrigger className="h-7 w-44 text-xs">
                  <SelectValue placeholder={t('page.loadExample')} />
                </SelectTrigger>
                <SelectContent>
                  {getExamples(locale).map((ex, idx) => (
                    <SelectItem key={idx} value={String(idx)} className="text-xs">
                      {ex.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex-1 overflow-hidden p-2">
            <CodeEditor
              value={code}
              onChange={setCode}
              currentLine={currentLine}
              className="h-full"
            />
          </div>
        </div>

        {/* Right panel - Tabs */}
        <div className="flex w-1/2 flex-col">
          <Tabs defaultValue="registers" className="flex h-full flex-col">
            <TabsList className="mx-2 mt-2 grid w-auto grid-cols-5">
              <TabsTrigger value="registers">{t('page.tabRegisters')}</TabsTrigger>
              <TabsTrigger value="memory">{t('page.tabMemory')}</TabsTrigger>
              <TabsTrigger value="output">{t('page.tabOutput')}</TabsTrigger>
              <TabsTrigger value="io">{t('page.tabIO')}</TabsTrigger>
              <TabsTrigger value="reference">{t('page.tabReference')}</TabsTrigger>
            </TabsList>

            <TabsContent value="registers" className="flex-1 overflow-hidden p-2 mt-0">
              {cpuState && (
                <RegisterView state={cpuState} className="h-full overflow-auto" />
              )}
            </TabsContent>

            <TabsContent value="memory" className="flex-1 overflow-hidden p-2 mt-0">
              <MemoryView
                memory={memory}
                pc={cpuState?.PC}
                sp={cpuState?.SP}
                onMemoryChange={handleMemoryChange}
                className="h-full"
              />
            </TabsContent>

            <TabsContent value="output" className="flex-1 overflow-hidden p-2 mt-0">
              <MachineCodeView
                instructions={assemblerResult?.instructions ?? []}
                errors={assemblerResult?.errors ?? []}
                symbols={assemblerResult?.symbols ?? new Map()}
                currentPC={cpuState?.PC}
                className="h-full"
              />
            </TabsContent>

            <TabsContent value="io" className="flex-1 overflow-hidden p-2 mt-0">
              <IOView
                outputPorts={outputPorts}
                onSetInputPort={handleSetInputPort}
                className="h-full"
              />
            </TabsContent>

            <TabsContent value="reference" className="flex-1 overflow-hidden p-2 mt-0">
              <InstructionReference className="h-full" />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Toaster />
    </div>
  )
}
