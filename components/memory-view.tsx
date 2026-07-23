'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface MemoryViewProps {
  memory: Uint8Array
  pc?: number
  sp?: number
  className?: string
  onMemoryChange?: (address: number, value: number) => void
}

const ROWS_PER_PAGE = 16
const BYTES_PER_ROW = 16
const BYTES_PER_PAGE = ROWS_PER_PAGE * BYTES_PER_ROW // 256 bytes per page

export function MemoryView({ memory, pc, sp, className, onMemoryChange }: MemoryViewProps) {
  const { t } = useLanguage()
  const [page, setPage] = useState(0)
  const [gotoAddress, setGotoAddress] = useState('')
  const [editingCell, setEditingCell] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  const totalPages = Math.ceil(65536 / BYTES_PER_PAGE)
  const startAddress = page * BYTES_PER_PAGE

  const pageData = useMemo(() => {
    const data: { address: number; bytes: number[] }[] = []
    for (let row = 0; row < ROWS_PER_PAGE; row++) {
      const rowAddress = startAddress + row * BYTES_PER_ROW
      const bytes: number[] = []
      for (let col = 0; col < BYTES_PER_ROW; col++) {
        bytes.push(memory[rowAddress + col] || 0)
      }
      data.push({ address: rowAddress, bytes })
    }
    return data
  }, [memory, startAddress])

  const handleGoto = useCallback(() => {
    const addr = parseInt(gotoAddress, 16)
    if (!isNaN(addr) && addr >= 0 && addr <= 0xFFFF) {
      setPage(Math.floor(addr / BYTES_PER_PAGE))
      setGotoAddress('')
    }
  }, [gotoAddress])

  const handleCellClick = useCallback((address: number) => {
    setEditingCell(address)
    setEditValue(memory[address].toString(16).toUpperCase().padStart(2, '0'))
  }, [memory])

  const handleCellChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase()
    if (/^[0-9A-F]{0,2}$/.test(val)) {
      setEditValue(val)
    }
  }, [])

  const handleCellBlur = useCallback(() => {
    if (editingCell !== null && editValue.length > 0) {
      const newValue = parseInt(editValue, 16)
      if (!isNaN(newValue) && onMemoryChange) {
        onMemoryChange(editingCell, newValue)
      }
    }
    setEditingCell(null)
    setEditValue('')
  }, [editingCell, editValue, onMemoryChange])

  const handleCellKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellBlur()
    } else if (e.key === 'Escape') {
      setEditingCell(null)
      setEditValue('')
    }
  }, [handleCellBlur])

  const goToPC = useCallback(() => {
    if (pc !== undefined) {
      setPage(Math.floor(pc / BYTES_PER_PAGE))
    }
  }, [pc])

  const goToSP = useCallback(() => {
    if (sp !== undefined) {
      setPage(Math.floor(sp / BYTES_PER_PAGE))
    }
  }, [sp])

  return (
    <Card className={cn('flex flex-col bg-card', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t('memoryView.title')}
          </CardTitle>
          <div className="flex items-center gap-2">
              <Button 
              variant="outline" 
              size="sm" 
              onClick={goToPC}
              className="h-7 text-xs"
            >
              {t('memoryView.goToPC')}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToSP}
              className="h-7 text-xs"
            >
              {t('memoryView.goToSP')}
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Input
            placeholder={t('memoryView.addressPlaceholder')}
            value={gotoAddress}
            onChange={(e) => setGotoAddress(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleGoto()}
            className="h-8 w-24 font-mono text-xs"
          />
          <Button variant="secondary" size="sm" onClick={handleGoto} className="h-8">
            {t('memoryView.go')}
          </Button>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="h-8 w-8"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-xs text-muted-foreground font-mono">
              {startAddress.toString(16).toUpperCase().padStart(4, '0')}-
              {Math.min(startAddress + BYTES_PER_PAGE - 1, 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="h-8 w-8"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-2">
        <div className="font-mono text-xs">
          {/* Header */}
          <div className="flex border-b border-border pb-1 mb-1 sticky top-0 bg-card">
            <div className="w-16 text-muted-foreground font-medium">{t('memoryView.colAddress')}</div>
            <div className="flex-1 flex">
              {Array.from({ length: BYTES_PER_ROW }, (_, i) => (
                <div key={i} className="w-6 text-center text-muted-foreground font-medium">
                  {i.toString(16).toUpperCase()}
                </div>
              ))}
            </div>
            <div className="w-36 pl-2 text-muted-foreground font-medium">{t('memoryView.ascii')}</div>
          </div>

          {/* Memory rows */}
          {pageData.map(({ address, bytes }) => (
            <div key={address} className="flex items-center hover:bg-muted/30 rounded">
              <div className="w-16 text-muted-foreground">
                {address.toString(16).toUpperCase().padStart(4, '0')}
              </div>
              <div className="flex-1 flex">
                {bytes.map((byte, i) => {
                  const cellAddress = address + i
                  const isPC = pc === cellAddress
                  const isSP = sp === cellAddress
                  const isEditing = editingCell === cellAddress

                  return (
                    <div
                      key={i}
                      className={cn(
                        'w-6 text-center cursor-pointer rounded transition-colors',
                        isPC && 'bg-primary/30 text-primary font-bold',
                        isSP && !isPC && 'bg-accent/30 text-accent font-bold',
                        !isPC && !isSP && byte !== 0 && 'text-foreground',
                        !isPC && !isSP && byte === 0 && 'text-muted-foreground/50',
                        !isEditing && 'hover:bg-muted/50'
                      )}
                      onClick={() => handleCellClick(cellAddress)}
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={handleCellChange}
                          onBlur={handleCellBlur}
                          onKeyDown={handleCellKeyDown}
                          className="w-full bg-input text-center outline-none rounded"
                          autoFocus
                        />
                      ) : (
                        byte.toString(16).toUpperCase().padStart(2, '0')
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="w-36 pl-2 text-muted-foreground">
                {bytes.map((byte, i) => {
                  const char = byte >= 32 && byte < 127 ? String.fromCharCode(byte) : '.'
                  return (
                    <span 
                      key={i}
                      className={cn(
                        byte >= 32 && byte < 127 && 'text-foreground'
                      )}
                    >
                      {char}
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
