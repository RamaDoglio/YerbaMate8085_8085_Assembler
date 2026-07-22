'use client'

import { useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  currentLine?: number
}

// 8085 instruction keywords
const INSTRUCTIONS = new Set([
  'MOV', 'MVI', 'LXI', 'LDA', 'STA', 'LHLD', 'SHLD', 'LDAX', 'STAX', 'XCHG',
  'ADD', 'ADI', 'ADC', 'ACI', 'SUB', 'SUI', 'SBB', 'SBI', 'INR', 'DCR', 'INX', 'DCX', 'DAD', 'DAA',
  'ANA', 'ANI', 'ORA', 'ORI', 'XRA', 'XRI', 'CMP', 'CPI', 'CMA', 'CMC', 'STC',
  'RLC', 'RRC', 'RAL', 'RAR',
  'JMP', 'JC', 'JNC', 'JZ', 'JNZ', 'JP', 'JM', 'JPE', 'JPO', 'PCHL',
  'CALL', 'CC', 'CNC', 'CZ', 'CNZ', 'CP', 'CM', 'CPE', 'CPO',
  'RET', 'RC', 'RNC', 'RZ', 'RNZ', 'RP', 'RM', 'RPE', 'RPO', 'RST',
  'PUSH', 'POP', 'XTHL', 'SPHL',
  'IN', 'OUT', 'NOP', 'HLT', 'DI', 'EI', 'RIM', 'SIM'
])

const REGISTERS = new Set(['A', 'B', 'C', 'D', 'E', 'H', 'L', 'M', 'SP', 'PSW'])

const DIRECTIVES = new Set(['ORG', 'DB', 'DW', 'DS', 'EQU', 'END'])

function highlightLine(line: string): React.ReactNode[] {
  const elements: React.ReactNode[] = []
  let remaining = line
  let key = 0

  // Check for comment
  const commentIndex = remaining.indexOf(';')
  let comment = ''
  if (commentIndex !== -1) {
    comment = remaining.substring(commentIndex)
    remaining = remaining.substring(0, commentIndex)
  }

  // Check for label at the start
  const labelMatch = remaining.match(/^([A-Za-z_][A-Za-z0-9_]*)(:)/)
  if (labelMatch) {
    elements.push(
      <span key={key++} className="text-[var(--code-label)]">{labelMatch[1]}</span>
    )
    elements.push(
      <span key={key++} className="text-muted-foreground">{labelMatch[2]}</span>
    )
    remaining = remaining.substring(labelMatch[0].length)
  }

  // Process the rest of the line
  const tokens = remaining.split(/(\s+|,)/)
  
  for (const token of tokens) {
    if (!token) continue
    
    const upperToken = token.toUpperCase()
    
    if (/^\s+$/.test(token) || token === ',') {
      elements.push(<span key={key++}>{token}</span>)
    } else if (INSTRUCTIONS.has(upperToken)) {
      elements.push(
        <span key={key++} className="text-[var(--code-instruction)] font-medium">{token}</span>
      )
    } else if (DIRECTIVES.has(upperToken)) {
      elements.push(
        <span key={key++} className="text-[var(--code-keyword)]">{token}</span>
      )
    } else if (REGISTERS.has(upperToken)) {
      elements.push(
        <span key={key++} className="text-[var(--code-register)]">{token}</span>
      )
    } else if (/^[0-9A-Fa-f]+[Hh]?$/.test(token) || /^0[Xx][0-9A-Fa-f]+$/.test(token) || /^[0-9]+$/.test(token) || /^[01]+[Bb]$/.test(token)) {
      elements.push(
        <span key={key++} className="text-[var(--code-number)]">{token}</span>
      )
    } else if (/^["'].*["']$/.test(token)) {
      elements.push(
        <span key={key++} className="text-[var(--code-string)]">{token}</span>
      )
    } else {
      elements.push(<span key={key++}>{token}</span>)
    }
  }

  // Add comment
  if (comment) {
    elements.push(
      <span key={key++} className="text-[var(--code-comment)] italic">{comment}</span>
    )
  }

  return elements
}

export function CodeEditor({ value, onChange, className, currentLine }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  const lines = value.split('\n')

  const syncScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current && lineNumbersRef.current) {
      const scrollTop = textareaRef.current.scrollTop
      const scrollLeft = textareaRef.current.scrollLeft
      highlightRef.current.scrollTop = scrollTop
      highlightRef.current.scrollLeft = scrollLeft
      lineNumbersRef.current.scrollTop = scrollTop
    }
  }, [])

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.addEventListener('scroll', syncScroll)
      return () => textarea.removeEventListener('scroll', syncScroll)
    }
  }, [syncScroll])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      onChange(newValue)
      
      // Set cursor position after tab
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
        }
      })
    }
  }

  return (
    <div className={cn('relative flex h-full overflow-hidden rounded-lg border border-border bg-card', className)}>
      {/* Line numbers */}
      <div
        ref={lineNumbersRef}
        className="flex-shrink-0 overflow-hidden bg-muted/30 py-3 text-right font-mono text-sm text-muted-foreground select-none"
        style={{ width: '3.5rem' }}
      >
        {lines.map((_, i) => (
          <div
            key={i}
            className={cn(
              'px-3 leading-6',
              currentLine === i + 1 && 'bg-primary/20 text-primary font-medium'
            )}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Editor area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Syntax highlighted overlay */}
        <div
          ref={highlightRef}
          className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-all p-3 font-mono text-sm leading-6"
          aria-hidden="true"
        >
          {lines.map((line, i) => (
            <div
              key={i}
              className={cn(
                'min-h-[1.5rem]',
                currentLine === i + 1 && 'bg-primary/10 -mx-3 px-3'
              )}
            >
              {highlightLine(line)}
            </div>
          ))}
        </div>

        {/* Actual textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 h-full w-full resize-none bg-transparent p-3 font-mono text-sm leading-6 text-transparent caret-foreground outline-none"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
        />
      </div>
    </div>
  )
}
