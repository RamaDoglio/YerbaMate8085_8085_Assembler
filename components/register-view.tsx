'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CPUState } from '@/lib/cpu-8085'
import { cn } from '@/lib/utils'

interface RegisterViewProps {
  state: CPUState
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
      'flex items-center gap-3 rounded-md px-3 py-2 transition-colors',
      highlight ? 'bg-primary/20' : 'bg-muted/50'
    )}>
      <span className="w-8 font-mono text-sm font-medium text-muted-foreground">
        {name}
      </span>
      <span className="font-mono text-base font-semibold text-primary">
        {hexValue}h
      </span>
      <span className="font-mono text-xs text-muted-foreground">
        {binValue}
      </span>
      <span className="ml-auto font-mono text-xs text-muted-foreground">
        {value}
      </span>
    </div>
  )
}

function FlagItem({ name, value, description }: { name: string; value: boolean; description: string }) {
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center rounded-md px-3 py-2 transition-colors',
        value ? 'bg-primary/30 text-primary' : 'bg-muted/50 text-muted-foreground'
      )}
      title={description}
    >
      <span className="text-xs font-medium">{name}</span>
      <span className="text-lg font-bold">{value ? '1' : '0'}</span>
    </div>
  )
}

export function RegisterView({ state, className }: RegisterViewProps) {
  return (
    <Card className={cn('bg-card', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Registros de la CPU
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 8-bit Registers */}
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Registros de 8 bits</h4>
          <div className="grid gap-1">
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
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Registros de 16 bits</h4>
          <div className="grid gap-1">
            <RegisterItem name="PC" value={state.PC} bits={16} highlight />
            <RegisterItem name="SP" value={state.SP} bits={16} />
          </div>
        </div>

        {/* Register Pairs */}
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Pares de Registros</h4>
          <div className="grid gap-1">
            <RegisterItem name="BC" value={(state.B << 8) | state.C} bits={16} />
            <RegisterItem name="DE" value={(state.D << 8) | state.E} bits={16} />
            <RegisterItem name="HL" value={(state.H << 8) | state.L} bits={16} />
          </div>
        </div>

        {/* Flags */}
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Banderas (PSW)</h4>
          <div className="grid grid-cols-5 gap-2">
            <FlagItem name="S" value={state.flags.S} description="Flag de Signo" />
            <FlagItem name="Z" value={state.flags.Z} description="Flag de Cero" />
            <FlagItem name="AC" value={state.flags.AC} description="Flag de Acarreo Auxiliar" />
            <FlagItem name="P" value={state.flags.P} description="Flag de Paridad" />
            <FlagItem name="CY" value={state.flags.CY} description="Flag de Acarreo" />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Estado</h4>
          <div className="flex flex-wrap gap-2">
            <div className={cn(
              'rounded-full px-3 py-1 text-xs font-medium',
              state.halted ? 'bg-destructive/20 text-destructive' : 'bg-green-500/20 text-green-500'
            )}>
              {state.halted ? 'DETENIDA' : 'EJECUTANDO'}
            </div>
            <div className={cn(
              'rounded-full px-3 py-1 text-xs font-medium',
              state.interruptEnabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              INT: {state.interruptEnabled ? 'ACT' : 'DES'}
            </div>
            <div className={cn(
              'rounded-full px-3 py-1 text-xs font-medium',
              state.serialInputData ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              ENT.SERIE: {state.serialInputData ? '1' : '0'}
            </div>
            <div className={cn(
              'rounded-full px-3 py-1 text-xs font-medium',
              state.serialOutputData ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              SAL.SERIE: {state.serialOutputData ? '1' : '0'}
            </div>
            <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              MASCARA: {state.interruptMask.toString(2).padStart(3, '0')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
