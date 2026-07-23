'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface IOViewProps {
  outputPorts: Record<number, number>
  onSetInputPort: (port: number, value: number) => void
  className?: string
}

export function IOView({ outputPorts, onSetInputPort, className }: IOViewProps) {
  const { t } = useLanguage()
  const [portAddress, setPortAddress] = useState('')
  const [portValue, setPortValue] = useState('')
  const [newPort, setNewPort] = useState('')
  const [newValue, setNewValue] = useState('')

  const entries = Object.entries(outputPorts)
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

  return (
    <Card className={cn('flex flex-col bg-card', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t('ioView.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-4 space-y-4">
        {/* Set Input Port */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">{t('ioView.inputConfig')}</h4>
          <div className="flex items-center gap-2">
            <Input
              placeholder={t('ioView.portPlaceholder')}
              value={portAddress}
              onChange={(e) => setPortAddress(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSetInput()}
              className="h-8 w-24 font-mono text-xs"
            />
            <span className="text-xs text-muted-foreground">=</span>
            <Input
              placeholder={t('ioView.valuePlaceholder')}
              value={portValue}
              onChange={(e) => setPortValue(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSetInput()}
              className="h-8 w-24 font-mono text-xs"
            />
            <Button variant="secondary" size="sm" onClick={handleSetInput} className="h-8">
              {t('ioView.assign')}
            </Button>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Output Ports Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">{t('ioView.outputTitle')}</h4>
          {entries.length > 0 ? (
            <div className="font-mono text-xs space-y-0.5">
                  <div className="flex border-b border-border pb-1 mb-1 text-muted-foreground">
                    <div className="w-24">{t('ioView.colPort')}</div>
                    <div className="w-16">{t('ioView.colValue')}</div>
                    <div className="w-16">{t('ioView.colBinary')}</div>
                  </div>
              <ScrollArea className="h-[200px]">
                {entries.map(({ port, value }) => (
                  <div key={port} className="flex items-center rounded px-1 hover:bg-muted/30">
                    <div className="w-24 text-primary">
                      {port.toString(16).toUpperCase().padStart(2, '0')}h
                    </div>
                    <div className="w-16 text-foreground">
                      {value.toString(16).toUpperCase().padStart(2, '0')}h
                    </div>
                    <div className="w-16 text-muted-foreground">
                      {value.toString(2).padStart(8, '0')}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          ) : (
            <div className="text-center text-muted-foreground text-xs py-4">
              {t('ioView.emptyState')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
