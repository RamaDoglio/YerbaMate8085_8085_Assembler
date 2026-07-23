import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { AssembledInstruction } from './assembler-8085'
import type { CPUState } from './cpu-8085'
import { translate, type Locale } from './i18n'
import { save } from '@tauri-apps/plugin-dialog'
import { writeFile, remove } from '@tauri-apps/plugin-fs'

export interface ExecutionStep {
  stepNumber: number
  instructionNumber: number
  instruction: string
  address: number
  state: CPUState
  mValue: number
  memoryAffected?: { address: number; value: number }[]
}

const FONT = 'Courier'
const TITLE_FONT = 'helvetica'

function hex4(v: number): string {
  return v.toString(16).toUpperCase().padStart(4, '0') + 'h'
}
function hex2(v: number): string {
  return v.toString(16).toUpperCase().padStart(2, '0') + 'h'
}

function formatMnemonic(inst: string): string {
  const parts = inst.split(/[\s,]+/).filter(Boolean)
  if (parts.length <= 1) return inst
  if (['LDA', 'STA', 'JMP', 'JZ', 'JNZ', 'JC', 'JNC', 'JP', 'JM', 'JPE', 'JPO',
       'CALL', 'LHLD', 'SHLD', 'LXI', 'MVI', 'ADI', 'ACI', 'SUI', 'SBI',
       'ANI', 'ORI', 'XRI', 'CPI'].includes(parts[0])) {
    return `${parts[0]}, ${parts.slice(1).join(' ')}`
  }
  if (parts[0] === 'RST') {
    return `${parts[0]} ${parts.slice(1).join(' ')}`
  }
  return `${parts[0]} ${parts.slice(1).join(' ')}`
}

function getObservation(inst: string, locale: Locale): string {
  const [op, ...args] = inst.split(/[\s,]+/).filter(Boolean)
  if (!op) return ''
  switch (op) {
    case 'LDA': return `A<-[${args[0]}]`
    case 'STA': return `[${args[0]}]<-A`
    case 'MOV': return `${args[0]}<-${args[1]}`
    case 'ADD': return `A<-A+${args[0]}`
    case 'SUB': return `A<-A-${args[0]}`
    case 'CMP': return `A - ${args[0]}`
    case 'ADI': return `A<-A+${args[0]}`
    case 'SUI': return `A<-A-${args[0]}`
    case 'INR': return `${args[0]}<-${args[0]}+1`
    case 'DCR': return `${args[0]}<-${args[0]}-1`
    case 'INX': return `${args[0]}<-${args[0]}+1`
    case 'DCX': return `${args[0]}<-${args[0]}-1`
    case 'DAD': return `HL<-HL+${args[0]}`
    case 'MVI': return `${args[0]}<-${args[1]}`
    case 'LXI': return `${args[0]}<-${args[1]}`
    case 'HLT': return translate(locale, 'pdf.observations.fin')
    case 'CMA': return 'A<-!A'
    case 'STC': return 'CY<-1'
    case 'CMC': return 'CY<-!CY'
    case 'XCHG': return 'HL<->DE'
    case 'SPHL': return 'SP<-HL'
    case 'PCHL': return 'PC<-HL'
    case 'NOP': return translate(locale, 'pdf.observations.noOp')
    case 'RET': return translate(locale, 'pdf.observations.return')
    case 'PUSH': return `[SP-2..1]<-${args[0]}`
    case 'POP': return `${args[0]}<-[SP..+1]`
    case 'STAX': return `[${args[0]}]<-A`
    case 'LDAX': return `A<-[${args[0]}]`
    case 'LHLD': return `L<-[${args[0]}],H<-[${args[0]}+1]`
    case 'SHLD': return `[${args[0]}]<-L,[${args[0]}+1]<-H`
    case 'JMP': case 'JZ': case 'JNZ': case 'JC': case 'JNC':
    case 'JP': case 'JM': case 'JPE': case 'JPO':
      return translate(locale, 'pdf.observations.jumpTo', args[0] || '')
    case 'CALL': return translate(locale, 'pdf.observations.callTo', args[0] || '')
    case 'RLC': return translate(locale, 'pdf.observations.rotateLeft')
    case 'RRC': return translate(locale, 'pdf.observations.rotateRight')
    case 'RAL': return translate(locale, 'pdf.observations.rotateLeftCarry')
    case 'RAR': return translate(locale, 'pdf.observations.rotateRightCarry')
    case 'DAA': return translate(locale, 'pdf.observations.decimalAdjust')
    case 'EI': return translate(locale, 'pdf.observations.enableInt')
    case 'DI': return translate(locale, 'pdf.observations.disableInt')
    case 'RIM': return translate(locale, 'pdf.observations.readIntMask')
    case 'SIM': return translate(locale, 'pdf.observations.writeIntMask')
    case 'RST': return `RST ${args[0]}`
    case 'ACI': return `A<-A+CY+${args[0]}`
    case 'SBI': return `A<-A-CY-${args[0]}`
    case 'ANI': return `A<-A&${args[0]}`
    case 'ORI': return `A<-A|${args[0]}`
    case 'XRI': return `A<-A^${args[0]}`
    case 'CPI': return `A - ${args[0]}`
    default: return ''
  }
}

export function generatePDF(
  instructions: AssembledInstruction[],
  steps: ExecutionStep[],
  relevantMemory: { address: number; value: number }[],
  studentName: string,
  exerciseNum: string = '1',
  sheetNum: string = '1',
  locale: Locale = 'es',
): Blob {
  const doc = new jsPDF('portrait', 'mm', 'a4')
  const pageW = 210
  const margin = 14
  let y = 20

  // ── Header info ──
  doc.setFont(TITLE_FONT, 'bold')
  doc.setFontSize(14)
  doc.text(translate(locale, 'pdf.title'), pageW / 2, y, { align: 'center' })
  y += 8

  doc.setFont(TITLE_FONT, 'normal')
  doc.setFontSize(11)
  const today = new Date().toLocaleDateString(locale === 'en' ? 'en-US' : 'es-AR')
  doc.text(`${translate(locale, 'pdf.student')} ${studentName}`, margin, y)
  doc.text(`${translate(locale, 'pdf.date')} ${today}`, pageW - margin, y, { align: 'right' })
  y += 6
  doc.text(`${translate(locale, 'pdf.exercise')} ${exerciseNum}`, margin, y)
  doc.text(`${translate(locale, 'pdf.sheet')} ${sheetNum}`, pageW - margin, y, { align: 'right' })
  y += 10

  // ════════════════════════════════════════════
  // PLANTILLA
  // ════════════════════════════════════════════
  const plantBody: (string | number)[][] = []
  instructions.forEach((inst, idx) => {
    const instNum = String(idx + 1).padStart(2, '0')
    const addr = hex4(inst.address)
    const opcode0 = inst.bytes[0] !== undefined
      ? inst.bytes[0].toString(16).toUpperCase().padStart(2, '0')
      : '--'
    const mnem = formatMnemonic(inst.instruction)
    const obs = getObservation(inst.instruction, locale)
    plantBody.push([instNum, addr, mnem, opcode0, obs])

    for (let b = 1; b < inst.bytes.length; b++) {
      const byteAddr = hex4((inst.address + b) & 0xFFFF)
      const byteLabel = b === 1 ? translate(locale, 'pdf.byteLabel2') : b === 2 ? translate(locale, 'pdf.byteLabel3') : `Byte ${b + 1}`
      const byteVal = inst.bytes[b].toString(16).toUpperCase().padStart(2, '0')
      plantBody.push(['', byteAddr, '-', byteVal, byteLabel])
    }
  })

  autoTable(doc, {
    head: [[
      { content: translate(locale, 'pdf.colInsNo'), styles: { fontStyle: 'bold' } },
      { content: translate(locale, 'pdf.colAddress'), styles: { fontStyle: 'bold' } },
      { content: translate(locale, 'pdf.colMnemonic'), styles: { fontStyle: 'bold' } },
      { content: translate(locale, 'pdf.colOpcode'), styles: { fontStyle: 'bold' } },
      { content: translate(locale, 'pdf.colObservation'), styles: { fontStyle: 'bold' } },
    ]],
    body: plantBody,
    startY: y,
    margin: { left: margin, right: margin },
    tableWidth: pageW - 2 * margin,
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 20 },
      2: { cellWidth: 42 },
      3: { cellWidth: 16 },
      4: { cellWidth: 56 },
    },
    styles: {
      font: FONT,
      fontSize: 8,
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [60, 60, 60],
      textColor: [255, 255, 255],
    },
    bodyStyles: {
      lineColor: [180, 180, 180],
    },
    didDrawPage: (data) => {
      y = data.cursor?.y ?? margin
    },
  })

  y += 8

  // ════════════════════════════════════════════
  // PRUEBA DE ESCRITORIO
  // ════════════════════════════════════════════
  if (y > 240) {
    doc.addPage()
    y = 20
  }

  // Header (same format as plantilla)
  doc.setFont(TITLE_FONT, 'bold')
  doc.setFontSize(14)
  doc.text(translate(locale, 'pdf.title'), pageW / 2, y, { align: 'center' })
  y += 8

  doc.setFont(TITLE_FONT, 'normal')
  doc.setFontSize(11)
  doc.text(`${translate(locale, 'pdf.student')} ${studentName}`, margin, y)
  doc.text(`${translate(locale, 'pdf.date')} ${today}`, pageW - margin, y, { align: 'right' })
  y += 6
  doc.text(`${translate(locale, 'pdf.exercise')} ${exerciseNum}`, margin, y)
  doc.text(`${translate(locale, 'pdf.sheet')} ${sheetNum}`, pageW - margin, y, { align: 'right' })
  y += 10

  // Combined memory + trace table
  // Header row 1: POSC. MEMORIA | MEMORIA | Ins. N° | REGISTROS | BANDERAS
  // Header row 2: (empty)       | (empty) | (empty)  | A B C D E H L M | Z P S CY

  const regLabels = ['A', 'B', 'C', 'D', 'E', 'H', 'L', 'M']
  const flagLabels = ['Z', 'P', 'S', 'CY']

  const traceHead = [
    [
      { content: translate(locale, 'pdf.poscMemory'), rowSpan: 2, styles: { fontStyle: 'bold' } },
      { content: translate(locale, 'pdf.memoryLabel'), rowSpan: 2, styles: { fontStyle: 'bold' } },
      { content: translate(locale, 'pdf.insNoShort'), rowSpan: 2, styles: { fontStyle: 'bold' } },
      { content: translate(locale, 'pdf.registers'), colSpan: 8, styles: { fontStyle: 'bold' } },
      { content: translate(locale, 'pdf.flags'), colSpan: 4, styles: { fontStyle: 'bold' } },
    ],
    [
      ...regLabels.map((l) => ({ content: l, styles: { fontStyle: 'bold' } })),
      ...flagLabels.map((l) => ({ content: l, styles: { fontStyle: 'bold' } })),
    ],
  ]

  const traceBody: (string | number)[][] = []

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    const s = step.state

    const memAddr = i < relevantMemory.length
      ? hex4(relevantMemory[i].address)
      : ''
    const memVal = i < relevantMemory.length
      ? hex2(relevantMemory[i].value)
      : ''

    const flag = (v: boolean) => (v ? '1' : '')

    traceBody.push([
      memAddr,
      memVal,
      String(step.instructionNumber),
      hex2(s.A),
      hex2(s.B),
      hex2(s.C),
      hex2(s.D),
      hex2(s.E),
      hex2(s.H),
      hex2(s.L),
      hex2(step.mValue),
      flag(s.flags.Z),
      flag(s.flags.P),
      flag(s.flags.S),
      flag(s.flags.CY),
    ])
  }

  autoTable(doc, {
    head: traceHead as any,
    body: traceBody,
    startY: y,
    margin: { left: margin, right: margin },
    tableWidth: pageW - 2 * margin,
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 14 },
      2: { cellWidth: 10 },
      3: { cellWidth: 12 },
      4: { cellWidth: 12 },
      5: { cellWidth: 12 },
      6: { cellWidth: 12 },
      7: { cellWidth: 12 },
      8: { cellWidth: 12 },
      9: { cellWidth: 12 },
      10: { cellWidth: 12 },
      11: { cellWidth: 10 },
      12: { cellWidth: 10 },
      13: { cellWidth: 10 },
      14: { cellWidth: 10 },
    },
    styles: {
      font: FONT,
      fontSize: 7,
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [60, 60, 60],
      textColor: [255, 255, 255],
    },
    bodyStyles: {
      lineColor: [180, 180, 180],
    },
    didParseCell: (data) => {
      if (data.section === 'head' && data.column.index <= 2) {
        data.cell.styles.minCellHeight = 14
      }
    },
  })

  return doc.output('blob')
}

export async function downloadBlob(blob: Blob, filename: string): Promise<void> {
  const path = await save({
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
    defaultPath: filename,
  })
  if (path) {
    const data = new Uint8Array(await blob.arrayBuffer())
    try {
      await writeFile(path, data)
    } catch {
      await remove(path)
      await writeFile(path, data)
    }
  }
}
