'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { AssembledInstruction, AssemblerError } from '@/lib/assembler-8085'
import { useLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { AlertCircle, AlertTriangle } from 'lucide-react'

interface MachineCodeViewProps {
  instructions: AssembledInstruction[]
  errors: AssemblerError[]
  symbols: Map<string, number>
  currentPC?: number
  className?: string
}

export function MachineCodeView({ 
  instructions, 
  errors, 
  symbols, 
  currentPC,
  className 
}: MachineCodeViewProps) {
  const { t } = useLanguage()
  return (
    <Card className={cn('flex flex-col bg-card', className)}>
      <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('machineCodeView.title')}
          </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* Errors and Warnings */}
            {errors.length > 0 && (
              <div className="space-y-1">
                {errors.map((error, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-start gap-2 rounded-md px-3 py-2 text-sm',
                      error.type === 'error' 
                        ? 'bg-destructive/10 text-destructive' 
                        : 'bg-yellow-500/10 text-yellow-500'
                    )}
                  >
                    {error.type === 'error' ? (
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <span>
                      {t('machineCodeView.line')} {error.line}: {error.message}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Symbol Table */}
            {symbols.size > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">{t('machineCodeView.symbols')}</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-md bg-muted/30 p-3">
                  {Array.from(symbols.entries()).map(([name, value]) => (
                    <div key={name} className="flex justify-between font-mono text-xs">
                      <span className="text-[var(--code-label)]">{name}</span>
                      <span className="text-muted-foreground">
                        {value.toString(16).toUpperCase().padStart(4, '0')}h
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            {instructions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">{t('machineCodeView.machineCode')}</h4>
                <div className="font-mono text-xs space-y-0.5">
                  {/* Header */}
                    <div className="flex border-b border-border pb-1 mb-1 text-muted-foreground">
                      <div className="w-12">{t('machineCodeView.colAddress')}</div>
                      <div className="w-24">{t('machineCodeView.colBytes')}</div>
                      <div className="w-12">{t('machineCodeView.colLine')}</div>
                      <div className="flex-1">{t('machineCodeView.colSource')}</div>
                    </div>

                  {instructions.map((inst, i) => {
                    const isCurrentPC = currentPC !== undefined && 
                      currentPC >= inst.address && 
                      currentPC < inst.address + inst.bytes.length

                    return (
                      <div
                        key={i}
                        className={cn(
                          'flex rounded px-1 -mx-1',
                          isCurrentPC && 'bg-primary/20'
                        )}
                      >
                        <div className="w-12 text-muted-foreground">
                          {inst.address.toString(16).toUpperCase().padStart(4, '0')}
                        </div>
                        <div className="w-24 text-primary">
                          {inst.bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')}
                        </div>
                        <div className="w-12 text-muted-foreground/70">
                          {inst.line}
                        </div>
                        <div className="flex-1">
                          {inst.label && (
                            <span className="text-[var(--code-label)]">{inst.label}: </span>
                          )}
                          <span className="text-foreground">{inst.instruction}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {instructions.length === 0 && errors.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                {t('machineCodeView.emptyState')}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
