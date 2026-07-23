'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { getInstructionCategories, type FlagEffect, type InstructionInfo, type InstructionCategory } from '@/lib/instruction-set-data'
import { ChevronDown, ChevronRight, Search } from 'lucide-react'

function formatOpcode(opcode: string): string {
  const parts = opcode.split(',')
  if (parts.length <= 4) return opcode
  const lines: string[] = []
  for (let i = 0; i < parts.length; i += 4)
    lines.push(parts.slice(i, i + 4).join(','))
  return lines.join('\n')
}

function FlagBadge({ effect }: { effect: FlagEffect }) {
  const colorMap: Record<FlagEffect, string> = {
    'affected': 'bg-blue-500/20 text-blue-500',
    'unaffected': 'bg-muted text-muted-foreground',
    'set': 'bg-green-500/20 text-green-500',
    'reset': 'bg-red-500/20 text-red-500',
    'modified': 'bg-yellow-500/20 text-yellow-500',
  }
  const labelMap: Record<FlagEffect, string> = {
    'affected': 'A',
    'unaffected': '-',
    'set': '1',
    'reset': '0',
    'modified': 'M',
  }
  return (
    <span className={cn('inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-mono font-medium', colorMap[effect])}>
      {labelMap[effect]}
    </span>
  )
}

function InstructionRow({ inst, isHighlighted }: { inst: InstructionInfo; isHighlighted: boolean }) {
  return (
    <div className={cn(
      'grid grid-cols-[120px_80px_40px_40px_1fr] gap-1 rounded px-2 py-1.5 text-xs items-start',
      isHighlighted && 'bg-primary/10'
    )}>
      <span className="font-mono font-semibold text-[var(--code-instruction)]">{inst.mnemonic}</span>
      <span className="font-mono text-muted-foreground whitespace-pre-line">{formatOpcode(inst.opcode)}</span>
      <span className="font-mono text-muted-foreground text-center">{inst.bytes}</span>
      <span className="font-mono text-muted-foreground text-center">{inst.cycles}</span>
      <span className="text-muted-foreground leading-tight">{inst.description}</span>
    </div>
  )
}

function FlagRow({ inst }: { inst: InstructionInfo }) {
  const { t } = useLanguage()
  return (
    <div className="flex items-center gap-1.5 px-2 pb-1.5">
      <span className="text-[10px] text-muted-foreground w-20">{t('instructionReference.flagsLabel')}</span>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-muted-foreground">Z</span>
        <FlagBadge effect={inst.flags.Z} />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-muted-foreground">S</span>
        <FlagBadge effect={inst.flags.S} />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-muted-foreground">P</span>
        <FlagBadge effect={inst.flags.P} />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-muted-foreground">CY</span>
        <FlagBadge effect={inst.flags.CY} />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-muted-foreground">AC</span>
        <FlagBadge effect={inst.flags.AC} />
      </div>
      <span className="text-[10px] text-muted-foreground ml-2">
        {t('instructionReference.modeLabel')} {inst.addressing}
      </span>
      {inst.example && (
        <span className="text-[10px] text-muted-foreground ml-2 font-mono">
          {t('instructionReference.exampleLabel')} {inst.example}
        </span>
      )}
    </div>
  )
}

function CategorySection({
  category,
  defaultOpen,
  searchTerm,
}: {
  category: InstructionCategory
  defaultOpen: boolean
  searchTerm: string
}) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(defaultOpen)

  const filtered = category.instructions.filter(
    (inst) =>
      inst.mnemonic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (searchTerm && filtered.length === 0) return null

  const displayInstructions = searchTerm ? filtered : category.instructions

  return (
    <div className="rounded-lg border border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-muted/50 rounded-t-lg"
      >
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <span>{category.name}</span>
        <span className="text-xs text-muted-foreground font-normal">({category.description})</span>
      </button>
      {open && (
        <div className="border-t border-border px-1 py-1">
          {/* Header */}
          <div className="grid grid-cols-[120px_80px_40px_40px_1fr] gap-1 px-2 py-1 text-[10px] text-muted-foreground font-medium">
            <span>{t('instructionReference.colInstruction')}</span>
            <span>{t('instructionReference.colOpcode')}</span>
            <span className="text-center">{t('instructionReference.colBytes')}</span>
            <span className="text-center">{t('instructionReference.colCycles')}</span>
            <span>{t('instructionReference.colDescription')}</span>
          </div>
          {displayInstructions.map((inst, i) => (
            <div key={i}>
              <InstructionRow inst={inst} isHighlighted={false} />
              <FlagRow inst={inst} />
              {i < displayInstructions.length - 1 && <div className="mx-2 border-b border-border/50" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FlagLegend() {
  const { t } = useLanguage()
  const items: { effect: FlagEffect; key: string }[] = [
    { effect: 'affected', key: 'flagAffected' },
    { effect: 'unaffected', key: 'flagNotAffected' },
    { effect: 'set', key: 'flagSet' },
    { effect: 'reset', key: 'flagReset' },
    { effect: 'modified', key: 'flagModified' },
  ]
  return (
    <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
      <span className="font-medium">{t('instructionReference.legendTitle')}</span>
      {items.map((item) => (
        <div key={item.effect} className="flex items-center gap-1">
          <FlagBadge effect={item.effect} />
          <span>{t(`instructionReference.${item.key}`)}</span>
        </div>
      ))}
    </div>
  )
}

export function InstructionReference({ className }: { className?: string }) {
  const { t, locale } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <Card className={cn('flex flex-col bg-card', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t('instructionReference.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-4">
          <div className="space-y-3 h-full flex flex-col min-h-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('instructionReference.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-xs font-mono"
            />
          </div>

          {/* Flag legend */}
          <FlagLegend />

          {/* Categories */}
          <ScrollArea className="flex-1 min-h-0 -mx-4 px-4">
            <div className="space-y-2 pb-4">
              {getInstructionCategories(locale).map((cat, idx) => (
                <CategorySection
                  key={idx}
                  category={cat}
                  defaultOpen={!searchTerm && idx === 0}
                  searchTerm={searchTerm}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
