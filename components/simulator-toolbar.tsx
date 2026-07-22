'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Kbd } from '@/components/ui/kbd'
import { 
  Play, 
  Square, 
  SkipForward, 
  RotateCcw, 
  Hammer,
  Download,
  Upload,
  Cpu,
  Sun,
  Moon,
  FileDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = theme === 'dark'

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="h-8 w-8 p-0"
      aria-label="Cambiar tema"
    >
      {mounted ? (
        isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  )
}

interface SimulatorToolbarProps {
  onAssemble: () => void
  onRun: () => void
  onStep: () => void
  onStop: () => void
  onReset: () => void
  onLoad?: () => void
  onSave?: () => void
  onExport?: () => void
  isRunning: boolean
  isAssembled: boolean
  className?: string
}

export function SimulatorToolbar({
  onAssemble,
  onRun,
  onStep,
  onStop,
  onReset,
  onLoad,
  onSave,
  onExport,
  isRunning,
  isAssembled,
  className
}: SimulatorToolbarProps) {
  return (
    <div className={cn(
      'flex items-center gap-2 p-2 border-b border-border bg-card/50',
      className
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-2">
        <Cpu className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">Simulador 8085</span>
      </div>

      <div className="h-6 w-px bg-border mx-2" />

      {/* File operations */}
      {onLoad && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onLoad} className="h-8 gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Abrir</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Abrir programa <Kbd>Ctrl+O</Kbd>
          </TooltipContent>
        </Tooltip>
      )}
      {onSave && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onSave} className="h-8 gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Guardar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Guardar programa <Kbd>Ctrl+S</Kbd>
          </TooltipContent>
        </Tooltip>
      )}

      {(onLoad || onSave) && <div className="h-6 w-px bg-border mx-2" />}

      {/* Assembler */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="default" 
            size="sm" 
            onClick={onAssemble}
            className="h-8 gap-2 bg-primary hover:bg-primary/90"
          >
            <Hammer className="h-4 w-4" />
            <span>Ensamblar</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Ensamblar código <Kbd>F7</Kbd> <span className="text-muted-foreground">o</span> <Kbd>Ctrl+Shift+A</Kbd>
        </TooltipContent>
      </Tooltip>

      <div className="h-6 w-px bg-border mx-2" />

      {/* Controles de ejecución */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onRun}
            disabled={!isAssembled || isRunning}
            className="h-8 gap-2"
          >
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Ejecutar</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Ejecutar programa <Kbd>F5</Kbd>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onStep}
            disabled={!isAssembled || isRunning}
            className="h-8 gap-2"
          >
            <SkipForward className="h-4 w-4" />
            <span className="hidden sm:inline">Paso</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Ejecutar una instrucción <Kbd>F10</Kbd>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onStop}
            disabled={!isRunning}
            className="h-8 gap-2"
          >
            <Square className="h-4 w-4" />
            <span className="hidden sm:inline">Detener</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Detener ejecución
        </TooltipContent>
      </Tooltip>

      <div className="h-6 w-px bg-border mx-2" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 gap-2 text-destructive hover:text-destructive"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Reiniciar</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Reiniciar CPU <Kbd>Ctrl+Shift+R</Kbd>
        </TooltipContent>
      </Tooltip>

      <div className="h-6 w-px bg-border mx-2" />

      {/* Export PDF */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={!isAssembled}
            className="h-8 gap-2"
          >
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Exportar plantilla y prueba de escritorio (.pdf)
        </TooltipContent>
      </Tooltip>

      {/* Status indicator */}
      <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
        <div className={cn(
          'h-2 w-2 rounded-full',
          isRunning ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'
        )} />
        <span>{isRunning ? 'Ejecutando' : 'Listo'}</span>
      </div>

      <div className="h-6 w-px bg-border mx-2" />

      {/* Theme toggle */}
      <ThemeToggle />
    </div>
  )
}
