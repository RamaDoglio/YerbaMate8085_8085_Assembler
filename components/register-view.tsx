'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CPUState } from '@/lib/cpu-8085'
import { useLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface RegisterViewProps {
  state: CPUState
  isAssembled?: boolean
  isRunning?: boolean
  className?: string
}

function RegisterItem({ 
  name, 
  value, 
  bits = 8,
  highlight = false 
}: { 
  name: string
  value: number
  bits?: 8 | 16
  highlight?: boolean
}) {
  const hexValue = bits === 16 
    ? value.toString(16).toUpperCase().padStart(4, '0')
    : value.toString(16).toUpperCase().padStart(2, '0')
  
  const binValue = bits === 16
    ? value.toString(2).padStart(16, '0')
    : value.toString(2).padStart(8, '0')

  return (
    <div className={cn(
      'flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors min-w-0',
      highlight ? 'bg-primary/20' : 'bg-muted/50'
    )}>
      <span className="w-6 shrink-0 font-mono text-sm font-medium text-muted-foreground">
        {name}
      </span>
      <span className="font-mono text-sm font-semibold text-primary shrink-0">
        {hexValue}h
      </span>
      <span className="hidden md:inline font-mono text-[11px] text-muted-foreground opacity-70 truncate">
        {binValue}
      </span>
      <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground min-w-[3rem] text-right">
        {value}
      </span>
    </div>
  )
}

function FlagItem({ name, value, description }: { name: string; value: boolean; description: string }) {
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center rounded-md py-1.5 transition-colors',
        value ? 'bg-primary/30 text-primary' : 'bg-muted/50 text-muted-foreground'
      )}
      title={description}
    >
      <span className="text-[10px] font-medium leading-tight">{name}</span>
      <span className="text-base font-bold leading-tight">{value ? '1' : '0'}</span>
    </div>
  )
}

export function RegisterView({ state, isAssembled = false, isRunning = false, className }: RegisterViewProps) {
  const { t } = useLanguage()

  // Lógica del estado
  let statusLabel = t('registerView.notAssembled')
  let statusClass = 'bg-muted text-muted-foreground'

  if (isAssembled) {
    if (state.halted) {
      statusLabel = t('registerView.halted')
      statusClass = 'bg-destructive/20 text-destructive'
    } else if (isRunning) {
      statusLabel = t('registerView.running')
      statusClass = 'bg-green-500/20 text-green-500'
    } else {
      statusLabel = t('registerView.assembled')
      statusClass = 'bg-primary/20 text-primary'
    }
  }

  return (
    <Card className={cn('bg-card', className)}>
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t('registerView.title')}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contenedor Flex principal */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* ─── Columna Izquierda: Registros ─── */}
          <div className="flex-1 space-y-6">
            
            {/* 8-bit Registers */}
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">{t('registerView.reg8bit')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <RegisterItem name="A" value={state.A} />
                <RegisterItem name="B" value={state.B} />
                <RegisterItem name="C" value={state.C} />
                <RegisterItem name="D" value={state.D} />
                <RegisterItem name="E" value={state.E} />
                <RegisterItem name="H" value={state.H} />
                <RegisterItem name="L" value={state.L} />
              </div>
            </div>

            {/* 16-bit Registers */}
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">{t('registerView.reg16bit')}</h4>
              <div className="grid grid-cols-1 gap-2">
                <RegisterItem name="PC" value={state.PC} bits={16} highlight />
                <RegisterItem name="SP" value={state.SP} bits={16} />
              </div>
            </div>

            {/* Register Pairs */}
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">{t('registerView.registerPairs')}</h4>
              <div className="grid grid-cols-1 gap-2">
                <RegisterItem name="BC" value={(state.B << 8) | state.C} bits={16} />
                <RegisterItem name="DE" value={(state.D << 8) | state.E} bits={16} />
                <RegisterItem name="HL" value={(state.H << 8) | state.L} bits={16} />
              </div>
            </div>

          </div>

          {/* ─── Columna Derecha: Banderas y Estado ─── */}
          <div className="w-full lg:w-60 space-y-4 lg:border-l lg:border-border/50 lg:pl-6">
            
            {/* Flags */}
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">{t('registerView.flags')}</h4>
              <div className="grid grid-cols-5 gap-1.5">
                <FlagItem name="S" value={state.flags.S} description={t('registerView.flagS')} />
                <FlagItem name="Z" value={state.flags.Z} description={t('registerView.flagZ')} />
                <FlagItem name="AC" value={state.flags.AC} description={t('registerView.flagAC')} />
                <FlagItem name="P" value={state.flags.P} description={t('registerView.flagP')} />
                <FlagItem name="CY" value={state.flags.CY} description={t('registerView.flagCY')} />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">{t('registerView.status')}</h4>
              <div className="flex flex-col gap-1.5">
                {/* Nuevo bloque dinámico de estado */}
                <div className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium text-center transition-colors',
                  statusClass
                )}>
                  {statusLabel}
                </div>

                <div className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium text-center',
                  state.interruptEnabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                )}>
                  INT: {state.interruptEnabled ? t('registerView.intOn') : t('registerView.intOff')}
                </div>
                <div className="flex gap-1.5">
                  <div className={cn(
                    'flex-1 rounded-md px-1 py-1 text-[11px] font-medium text-center truncate',
                    state.serialInputData ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  )} title={t('registerView.serialIn')}>
                    {t('registerView.serialIn')}: {state.serialInputData ? '1' : '0'}
                  </div>
                  <div className={cn(
                    'flex-1 rounded-md px-1 py-1 text-[11px] font-medium text-center truncate',
                    state.serialOutputData ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  )} title={t('registerView.serialOut')}>
                    {t('registerView.serialOut')}: {state.serialOutputData ? '1' : '0'}
                  </div>
                </div>
                <div className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-center text-muted-foreground">
                  {t('registerView.mask')}: {state.interruptMask.toString(2).padStart(3, '0')}
                </div>
              </div>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  )
}