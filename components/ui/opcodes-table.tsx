'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLanguage } from '@/lib/i18n'
import { getAllInstructions, getInstructionInfo } from '@/lib/assembler-8085'
import { cn } from '@/lib/utils'

export function OpcodesTable({ className }: { className?: string }) {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')

  const instructions = useMemo(() => {
    return getAllInstructions().map(key => {
      const info = getInstructionInfo(key)!
      return {
        mnemonic: key,
        opcode: info.opcode.toString(16).toUpperCase().padStart(2, '0') + 'h',
        bytes: info.bytes
      }
    })
  }, [])

  const filtered = useMemo(() => {
    if (!search) return instructions
    const q = search.toUpperCase()
    return instructions.filter(i => i.mnemonic.includes(q) || i.opcode.includes(q))
  }, [instructions, search])

  return (
    <Card className={cn('flex flex-col bg-card', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t('opcodesTable.title')}
        </CardTitle>
        <Input
          placeholder={t('opcodesTable.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 mt-2 max-w-sm"
        />
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full pr-4">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-card border-b border-border z-10">
              <tr>
                <th className="py-2 px-2 font-medium text-muted-foreground">{t('opcodesTable.colMnemonic')}</th>
                <th className="py-2 px-2 font-medium text-muted-foreground">{t('opcodesTable.colOpcode')}</th>
                <th className="py-2 px-2 font-medium text-muted-foreground text-center">{t('opcodesTable.colBytes')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inst, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-1.5 px-2 font-mono text-[var(--code-instruction)]">{inst.mnemonic}</td>
                  <td className="py-1.5 px-2 font-mono text-[var(--code-number)]">{inst.opcode}</td>
                  <td className="py-1.5 px-2 text-center text-muted-foreground">{inst.bytes}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-muted-foreground">
                    {t('opcodesTable.emptyState')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}