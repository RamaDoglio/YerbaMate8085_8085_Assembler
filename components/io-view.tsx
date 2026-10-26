'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface IOViewProps {
  inputPorts: Record<number, number>
  outputPorts: Record<number, number>
  onSetInputPort: (port: number, value: number) => void
  className?: string
}

export function IOView({ inputPorts, outputPorts, onSetInputPort, className }: IOViewProps) {
  const { t } = useLanguage()
  const [portAddress, setPortAddress] = useState('')
  const [portValue, setPortValue] = useState('')

  const outputEntries = Object.entries(outputPorts)
    .map(([port, value]) => ({ port: parseInt(port), value }))
    .sort((a, b) => a.port - b.port)

  const inputEntries = Object.entries(inputPorts)
    .map(([port, value]) => ({ port: parseInt(port), value }))
    .sort((a, b) => a.port - b.port)

  const handleSetInput = useCallback(() => {
    const port = parseInt(portAddress, 16)
    const value = parseInt(portValue, 16)
    if (!isNaN(port) && port >= 0 && port <= 0xFF && !isNaN(value) && value >= 0 && value <= 0xFF) {
      onSetInputPort(port, value)
      setPortAddress('')
      setPortValue('')
    }
  }, [portAddress, portValue, onSetInputPort])

  // Función auxiliar para renderizar el carácter ASCII
  const getAsciiChar = (val: number) => {
    // Rango imprimible estándar (32 a 126)
    return val >= 32 && val <= 126 ? String.fromCharCode(val) : '.'
  }

  return (
    <Card className={cn('flex flex-col bg-card', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t('ioView.title')}
        </CardTitle>
      </CardHeader>
      {/* Cambiamos overflow-hidden por overflow-y-auto para que crezca y scrollee */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Set Input Port */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">{t('ioView.inputConfig')}</h4>
          <div className="flex items-center gap-2">
            <Input
              placeholder={t('ioView.portPlaceholder')}
              value={portAddress}
              onChange={(e) => setPortAddress(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSetInput()}
              className="h-8 flex-1 min-w-0 px-2 font-mono text-xs"
            />
            <span className="text-xs text-muted-foreground">=</span>
            <Input
              placeholder={t('ioView.valuePlaceholder')}
              value={portValue}
              onChange={(e) => setPortValue(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSetInput()}
              className="h-8 flex-1 min-w-0 px-2 font-mono text-xs"
            />
            <Button variant="secondary" size="sm" onClick={handleSetInput} className="h-8">
              {t('ioView.assign')}
            </Button>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Configured Input Ports Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">{t('ioView.inputTitle')}</h4>
          {inputEntries.length > 0 ? (
            <div className="font-mono text-xs space-y-1">
              <div className="flex border-b border-border pb-1 mb-2 text-muted-foreground">
                <div className="w-20">{t('ioView.colPort')}</div>
                <div className="w-16">{t('ioView.colValue')}</div>
                <div className="w-24">{t('ioView.colBinary')}</div>
                <div className="w-12">{t('ioView.colAscii')}</div>
              </div>
              {/* Sin ScrollArea, fluye naturalmente */}
              <div className="space-y-0.5">
                {inputEntries.map(({ port, value }) => (
                  <div key={port} className="flex items-center rounded px-1 hover:bg-muted/30">
                    <div className="w-20 text-primary">
                      {port.toString(16).toUpperCase().padStart(2, '0')}h
                    </div>
                    <div className="w-16 text-foreground">
                      {value.toString(16).toUpperCase().padStart(2, '0')}h
                    </div>
                    <div className="w-24 text-muted-foreground">
                      {value.toString(2).padStart(8, '0')}
                    </div>
                    <div className="w-12 text-[var(--code-string)] font-bold text-center">
                      {getAsciiChar(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground text-xs py-3">
              {t('ioView.inputEmptyState')}
            </div>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* Output Ports Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">{t('ioView.outputTitle')}</h4>
          {outputEntries.length > 0 ? (
            <div className="font-mono text-xs space-y-1">
              <div className="flex border-b border-border pb-1 mb-2 text-muted-foreground">
                <div className="w-20">{t('ioView.colPort')}</div>
                <div className="w-16">{t('ioView.colValue')}</div>
                <div className="w-24">{t('ioView.colBinary')}</div>
                <div className="w-12">{t('ioView.colAscii')}</div>
              </div>
              <div className="space-y-0.5">
                {outputEntries.map(({ port, value }) => (
                  <div key={port} className="flex items-center rounded px-1 hover:bg-muted/30">
                    <div className="w-20 text-primary">
                      {port.toString(16).toUpperCase().padStart(2, '0')}h
                    </div>
                    <div className="w-16 text-foreground">
                      {value.toString(16).toUpperCase().padStart(2, '0')}h
                    </div>
                    <div className="w-24 text-muted-foreground">
                      {value.toString(2).padStart(8, '0')}
                    </div>
                    <div className="w-12 text-[var(--code-string)] font-bold text-center">
                      {getAsciiChar(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground text-xs py-3">
              {t('ioView.emptyState')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}