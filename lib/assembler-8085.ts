// Intel 8085 Instruction Set and Assembler

export interface AssemblerError {
  line: number
  message: string
  type: 'error' | 'warning'
}

export interface AssembledInstruction {
  address: number
  bytes: number[]
  label?: string
  instruction: string
  line: number
}

export interface AssemblerResult {
  success: boolean
  machineCode: number[]
  instructions: AssembledInstruction[]
  symbols: Map<string, number>
  errors: AssemblerError[]
  startAddress: number
}

// 8085 Instruction definitions with opcode and byte count
const INSTRUCTIONS: Record<string, { opcode: number; bytes: number; type: string }> = {
  // Data Transfer Instructions
  'MOV A,A': { opcode: 0x7F, bytes: 1, type: 'move' },
  'MOV A,B': { opcode: 0x78, bytes: 1, type: 'move' },
  'MOV A,C': { opcode: 0x79, bytes: 1, type: 'move' },
  'MOV A,D': { opcode: 0x7A, bytes: 1, type: 'move' },
  'MOV A,E': { opcode: 0x7B, bytes: 1, type: 'move' },
  'MOV A,H': { opcode: 0x7C, bytes: 1, type: 'move' },
  'MOV A,L': { opcode: 0x7D, bytes: 1, type: 'move' },
  'MOV A,M': { opcode: 0x7E, bytes: 1, type: 'move' },
  'MOV B,A': { opcode: 0x47, bytes: 1, type: 'move' },
  'MOV B,B': { opcode: 0x40, bytes: 1, type: 'move' },
  'MOV B,C': { opcode: 0x41, bytes: 1, type: 'move' },
  'MOV B,D': { opcode: 0x42, bytes: 1, type: 'move' },
  'MOV B,E': { opcode: 0x43, bytes: 1, type: 'move' },
  'MOV B,H': { opcode: 0x44, bytes: 1, type: 'move' },
  'MOV B,L': { opcode: 0x45, bytes: 1, type: 'move' },
  'MOV B,M': { opcode: 0x46, bytes: 1, type: 'move' },
  'MOV C,A': { opcode: 0x4F, bytes: 1, type: 'move' },
  'MOV C,B': { opcode: 0x48, bytes: 1, type: 'move' },
  'MOV C,C': { opcode: 0x49, bytes: 1, type: 'move' },
  'MOV C,D': { opcode: 0x4A, bytes: 1, type: 'move' },
  'MOV C,E': { opcode: 0x4B, bytes: 1, type: 'move' },
  'MOV C,H': { opcode: 0x4C, bytes: 1, type: 'move' },
  'MOV C,L': { opcode: 0x4D, bytes: 1, type: 'move' },
  'MOV C,M': { opcode: 0x4E, bytes: 1, type: 'move' },
  'MOV D,A': { opcode: 0x57, bytes: 1, type: 'move' },
  'MOV D,B': { opcode: 0x50, bytes: 1, type: 'move' },
  'MOV D,C': { opcode: 0x51, bytes: 1, type: 'move' },
  'MOV D,D': { opcode: 0x52, bytes: 1, type: 'move' },
  'MOV D,E': { opcode: 0x53, bytes: 1, type: 'move' },
  'MOV D,H': { opcode: 0x54, bytes: 1, type: 'move' },
  'MOV D,L': { opcode: 0x55, bytes: 1, type: 'move' },
  'MOV D,M': { opcode: 0x56, bytes: 1, type: 'move' },
  'MOV E,A': { opcode: 0x5F, bytes: 1, type: 'move' },
  'MOV E,B': { opcode: 0x58, bytes: 1, type: 'move' },
  'MOV E,C': { opcode: 0x59, bytes: 1, type: 'move' },
  'MOV E,D': { opcode: 0x5A, bytes: 1, type: 'move' },
  'MOV E,E': { opcode: 0x5B, bytes: 1, type: 'move' },
  'MOV E,H': { opcode: 0x5C, bytes: 1, type: 'move' },
  'MOV E,L': { opcode: 0x5D, bytes: 1, type: 'move' },
  'MOV E,M': { opcode: 0x5E, bytes: 1, type: 'move' },
  'MOV H,A': { opcode: 0x67, bytes: 1, type: 'move' },
  'MOV H,B': { opcode: 0x60, bytes: 1, type: 'move' },
  'MOV H,C': { opcode: 0x61, bytes: 1, type: 'move' },
  'MOV H,D': { opcode: 0x62, bytes: 1, type: 'move' },
  'MOV H,E': { opcode: 0x63, bytes: 1, type: 'move' },
  'MOV H,H': { opcode: 0x64, bytes: 1, type: 'move' },
  'MOV H,L': { opcode: 0x65, bytes: 1, type: 'move' },
  'MOV H,M': { opcode: 0x66, bytes: 1, type: 'move' },
  'MOV L,A': { opcode: 0x6F, bytes: 1, type: 'move' },
  'MOV L,B': { opcode: 0x68, bytes: 1, type: 'move' },
  'MOV L,C': { opcode: 0x69, bytes: 1, type: 'move' },
  'MOV L,D': { opcode: 0x6A, bytes: 1, type: 'move' },
  'MOV L,E': { opcode: 0x6B, bytes: 1, type: 'move' },
  'MOV L,H': { opcode: 0x6C, bytes: 1, type: 'move' },
  'MOV L,L': { opcode: 0x6D, bytes: 1, type: 'move' },
  'MOV L,M': { opcode: 0x6E, bytes: 1, type: 'move' },
  'MOV M,A': { opcode: 0x77, bytes: 1, type: 'move' },
  'MOV M,B': { opcode: 0x70, bytes: 1, type: 'move' },
  'MOV M,C': { opcode: 0x71, bytes: 1, type: 'move' },
  'MOV M,D': { opcode: 0x72, bytes: 1, type: 'move' },
  'MOV M,E': { opcode: 0x73, bytes: 1, type: 'move' },
  'MOV M,H': { opcode: 0x74, bytes: 1, type: 'move' },
  'MOV M,L': { opcode: 0x75, bytes: 1, type: 'move' },

  // MVI - Move Immediate
  'MVI A': { opcode: 0x3E, bytes: 2, type: 'immediate' },
  'MVI B': { opcode: 0x06, bytes: 2, type: 'immediate' },
  'MVI C': { opcode: 0x0E, bytes: 2, type: 'immediate' },
  'MVI D': { opcode: 0x16, bytes: 2, type: 'immediate' },
  'MVI E': { opcode: 0x1E, bytes: 2, type: 'immediate' },
  'MVI H': { opcode: 0x26, bytes: 2, type: 'immediate' },
  'MVI L': { opcode: 0x2E, bytes: 2, type: 'immediate' },
  'MVI M': { opcode: 0x36, bytes: 2, type: 'immediate' },

  // LXI - Load Register Pair Immediate
  'LXI B': { opcode: 0x01, bytes: 3, type: 'immediate16' },
  'LXI D': { opcode: 0x11, bytes: 3, type: 'immediate16' },
  'LXI H': { opcode: 0x21, bytes: 3, type: 'immediate16' },
  'LXI SP': { opcode: 0x31, bytes: 3, type: 'immediate16' },

  // Load/Store
  'LDA': { opcode: 0x3A, bytes: 3, type: 'address' },
  'STA': { opcode: 0x32, bytes: 3, type: 'address' },
  'LHLD': { opcode: 0x2A, bytes: 3, type: 'address' },
  'SHLD': { opcode: 0x22, bytes: 3, type: 'address' },
  'LDAX B': { opcode: 0x0A, bytes: 1, type: 'simple' },
  'LDAX D': { opcode: 0x1A, bytes: 1, type: 'simple' },
  'STAX B': { opcode: 0x02, bytes: 1, type: 'simple' },
  'STAX D': { opcode: 0x12, bytes: 1, type: 'simple' },
  'XCHG': { opcode: 0xEB, bytes: 1, type: 'simple' },

  // Arithmetic Instructions
  'ADD A': { opcode: 0x87, bytes: 1, type: 'simple' },
  'ADD B': { opcode: 0x80, bytes: 1, type: 'simple' },
  'ADD C': { opcode: 0x81, bytes: 1, type: 'simple' },
  'ADD D': { opcode: 0x82, bytes: 1, type: 'simple' },
  'ADD E': { opcode: 0x83, bytes: 1, type: 'simple' },
  'ADD H': { opcode: 0x84, bytes: 1, type: 'simple' },
  'ADD L': { opcode: 0x85, bytes: 1, type: 'simple' },
  'ADD M': { opcode: 0x86, bytes: 1, type: 'simple' },
  'ADI': { opcode: 0xC6, bytes: 2, type: 'immediate' },

  'ADC A': { opcode: 0x8F, bytes: 1, type: 'simple' },
  'ADC B': { opcode: 0x88, bytes: 1, type: 'simple' },
  'ADC C': { opcode: 0x89, bytes: 1, type: 'simple' },
  'ADC D': { opcode: 0x8A, bytes: 1, type: 'simple' },
  'ADC E': { opcode: 0x8B, bytes: 1, type: 'simple' },
  'ADC H': { opcode: 0x8C, bytes: 1, type: 'simple' },
  'ADC L': { opcode: 0x8D, bytes: 1, type: 'simple' },
  'ADC M': { opcode: 0x8E, bytes: 1, type: 'simple' },
  'ACI': { opcode: 0xCE, bytes: 2, type: 'immediate' },

  'SUB A': { opcode: 0x97, bytes: 1, type: 'simple' },
  'SUB B': { opcode: 0x90, bytes: 1, type: 'simple' },
  'SUB C': { opcode: 0x91, bytes: 1, type: 'simple' },
  'SUB D': { opcode: 0x92, bytes: 1, type: 'simple' },
  'SUB E': { opcode: 0x93, bytes: 1, type: 'simple' },
  'SUB H': { opcode: 0x94, bytes: 1, type: 'simple' },
  'SUB L': { opcode: 0x95, bytes: 1, type: 'simple' },
  'SUB M': { opcode: 0x96, bytes: 1, type: 'simple' },
  'SUI': { opcode: 0xD6, bytes: 2, type: 'immediate' },

  'SBB A': { opcode: 0x9F, bytes: 1, type: 'simple' },
  'SBB B': { opcode: 0x98, bytes: 1, type: 'simple' },
  'SBB C': { opcode: 0x99, bytes: 1, type: 'simple' },
  'SBB D': { opcode: 0x9A, bytes: 1, type: 'simple' },
  'SBB E': { opcode: 0x9B, bytes: 1, type: 'simple' },
  'SBB H': { opcode: 0x9C, bytes: 1, type: 'simple' },
  'SBB L': { opcode: 0x9D, bytes: 1, type: 'simple' },
  'SBB M': { opcode: 0x9E, bytes: 1, type: 'simple' },
  'SBI': { opcode: 0xDE, bytes: 2, type: 'immediate' },

  // Increment/Decrement
  'INR A': { opcode: 0x3C, bytes: 1, type: 'simple' },
  'INR B': { opcode: 0x04, bytes: 1, type: 'simple' },
  'INR C': { opcode: 0x0C, bytes: 1, type: 'simple' },
  'INR D': { opcode: 0x14, bytes: 1, type: 'simple' },
  'INR E': { opcode: 0x1C, bytes: 1, type: 'simple' },
  'INR H': { opcode: 0x24, bytes: 1, type: 'simple' },
  'INR L': { opcode: 0x2C, bytes: 1, type: 'simple' },
  'INR M': { opcode: 0x34, bytes: 1, type: 'simple' },

  'DCR A': { opcode: 0x3D, bytes: 1, type: 'simple' },
  'DCR B': { opcode: 0x05, bytes: 1, type: 'simple' },
  'DCR C': { opcode: 0x0D, bytes: 1, type: 'simple' },
  'DCR D': { opcode: 0x15, bytes: 1, type: 'simple' },
  'DCR E': { opcode: 0x1D, bytes: 1, type: 'simple' },
  'DCR H': { opcode: 0x25, bytes: 1, type: 'simple' },
  'DCR L': { opcode: 0x2D, bytes: 1, type: 'simple' },
  'DCR M': { opcode: 0x35, bytes: 1, type: 'simple' },

  'INX B': { opcode: 0x03, bytes: 1, type: 'simple' },
  'INX D': { opcode: 0x13, bytes: 1, type: 'simple' },
  'INX H': { opcode: 0x23, bytes: 1, type: 'simple' },
  'INX SP': { opcode: 0x33, bytes: 1, type: 'simple' },

  'DCX B': { opcode: 0x0B, bytes: 1, type: 'simple' },
  'DCX D': { opcode: 0x1B, bytes: 1, type: 'simple' },
  'DCX H': { opcode: 0x2B, bytes: 1, type: 'simple' },
  'DCX SP': { opcode: 0x3B, bytes: 1, type: 'simple' },

  'DAD B': { opcode: 0x09, bytes: 1, type: 'simple' },
  'DAD D': { opcode: 0x19, bytes: 1, type: 'simple' },
  'DAD H': { opcode: 0x29, bytes: 1, type: 'simple' },
  'DAD SP': { opcode: 0x39, bytes: 1, type: 'simple' },

  'DAA': { opcode: 0x27, bytes: 1, type: 'simple' },

  // Logical Instructions
  'ANA A': { opcode: 0xA7, bytes: 1, type: 'simple' },
  'ANA B': { opcode: 0xA0, bytes: 1, type: 'simple' },
  'ANA C': { opcode: 0xA1, bytes: 1, type: 'simple' },
  'ANA D': { opcode: 0xA2, bytes: 1, type: 'simple' },
  'ANA E': { opcode: 0xA3, bytes: 1, type: 'simple' },
  'ANA H': { opcode: 0xA4, bytes: 1, type: 'simple' },
  'ANA L': { opcode: 0xA5, bytes: 1, type: 'simple' },
  'ANA M': { opcode: 0xA6, bytes: 1, type: 'simple' },
  'ANI': { opcode: 0xE6, bytes: 2, type: 'immediate' },

  'ORA A': { opcode: 0xB7, bytes: 1, type: 'simple' },
  'ORA B': { opcode: 0xB0, bytes: 1, type: 'simple' },
  'ORA C': { opcode: 0xB1, bytes: 1, type: 'simple' },
  'ORA D': { opcode: 0xB2, bytes: 1, type: 'simple' },
  'ORA E': { opcode: 0xB3, bytes: 1, type: 'simple' },
  'ORA H': { opcode: 0xB4, bytes: 1, type: 'simple' },
  'ORA L': { opcode: 0xB5, bytes: 1, type: 'simple' },
  'ORA M': { opcode: 0xB6, bytes: 1, type: 'simple' },
  'ORI': { opcode: 0xF6, bytes: 2, type: 'immediate' },

  'XRA A': { opcode: 0xAF, bytes: 1, type: 'simple' },
  'XRA B': { opcode: 0xA8, bytes: 1, type: 'simple' },
  'XRA C': { opcode: 0xA9, bytes: 1, type: 'simple' },
  'XRA D': { opcode: 0xAA, bytes: 1, type: 'simple' },
  'XRA E': { opcode: 0xAB, bytes: 1, type: 'simple' },
  'XRA H': { opcode: 0xAC, bytes: 1, type: 'simple' },
  'XRA L': { opcode: 0xAD, bytes: 1, type: 'simple' },
  'XRA M': { opcode: 0xAE, bytes: 1, type: 'simple' },
  'XRI': { opcode: 0xEE, bytes: 2, type: 'immediate' },

  'CMP A': { opcode: 0xBF, bytes: 1, type: 'simple' },
  'CMP B': { opcode: 0xB8, bytes: 1, type: 'simple' },
  'CMP C': { opcode: 0xB9, bytes: 1, type: 'simple' },
  'CMP D': { opcode: 0xBA, bytes: 1, type: 'simple' },
  'CMP E': { opcode: 0xBB, bytes: 1, type: 'simple' },
  'CMP H': { opcode: 0xBC, bytes: 1, type: 'simple' },
  'CMP L': { opcode: 0xBD, bytes: 1, type: 'simple' },
  'CMP M': { opcode: 0xBE, bytes: 1, type: 'simple' },
  'CPI': { opcode: 0xFE, bytes: 2, type: 'immediate' },

  'CMA': { opcode: 0x2F, bytes: 1, type: 'simple' },
  'CMC': { opcode: 0x3F, bytes: 1, type: 'simple' },
  'STC': { opcode: 0x37, bytes: 1, type: 'simple' },

  // Rotate Instructions
  'RLC': { opcode: 0x07, bytes: 1, type: 'simple' },
  'RRC': { opcode: 0x0F, bytes: 1, type: 'simple' },
  'RAL': { opcode: 0x17, bytes: 1, type: 'simple' },
  'RAR': { opcode: 0x1F, bytes: 1, type: 'simple' },

  // Branch Instructions
  'JMP': { opcode: 0xC3, bytes: 3, type: 'address' },
  'JC': { opcode: 0xDA, bytes: 3, type: 'address' },
  'JNC': { opcode: 0xD2, bytes: 3, type: 'address' },
  'JZ': { opcode: 0xCA, bytes: 3, type: 'address' },
  'JNZ': { opcode: 0xC2, bytes: 3, type: 'address' },
  'JP': { opcode: 0xF2, bytes: 3, type: 'address' },
  'JM': { opcode: 0xFA, bytes: 3, type: 'address' },
  'JPE': { opcode: 0xEA, bytes: 3, type: 'address' },
  'JPO': { opcode: 0xE2, bytes: 3, type: 'address' },
  'PCHL': { opcode: 0xE9, bytes: 1, type: 'simple' },

  // Call Instructions
  'CALL': { opcode: 0xCD, bytes: 3, type: 'address' },
  'CC': { opcode: 0xDC, bytes: 3, type: 'address' },
  'CNC': { opcode: 0xD4, bytes: 3, type: 'address' },
  'CZ': { opcode: 0xCC, bytes: 3, type: 'address' },
  'CNZ': { opcode: 0xC4, bytes: 3, type: 'address' },
  'CP': { opcode: 0xF4, bytes: 3, type: 'address' },
  'CM': { opcode: 0xFC, bytes: 3, type: 'address' },
  'CPE': { opcode: 0xEC, bytes: 3, type: 'address' },
  'CPO': { opcode: 0xE4, bytes: 3, type: 'address' },

  // Return Instructions
  'RET': { opcode: 0xC9, bytes: 1, type: 'simple' },
  'RC': { opcode: 0xD8, bytes: 1, type: 'simple' },
  'RNC': { opcode: 0xD0, bytes: 1, type: 'simple' },
  'RZ': { opcode: 0xC8, bytes: 1, type: 'simple' },
  'RNZ': { opcode: 0xC0, bytes: 1, type: 'simple' },
  'RP': { opcode: 0xF0, bytes: 1, type: 'simple' },
  'RM': { opcode: 0xF8, bytes: 1, type: 'simple' },
  'RPE': { opcode: 0xE8, bytes: 1, type: 'simple' },
  'RPO': { opcode: 0xE0, bytes: 1, type: 'simple' },

  // RST Instructions
  'RST 0': { opcode: 0xC7, bytes: 1, type: 'simple' },
  'RST 1': { opcode: 0xCF, bytes: 1, type: 'simple' },
  'RST 2': { opcode: 0xD7, bytes: 1, type: 'simple' },
  'RST 3': { opcode: 0xDF, bytes: 1, type: 'simple' },
  'RST 4': { opcode: 0xE7, bytes: 1, type: 'simple' },
  'RST 5': { opcode: 0xEF, bytes: 1, type: 'simple' },
  'RST 6': { opcode: 0xF7, bytes: 1, type: 'simple' },
  'RST 7': { opcode: 0xFF, bytes: 1, type: 'simple' },

  // Stack Operations
  'PUSH B': { opcode: 0xC5, bytes: 1, type: 'simple' },
  'PUSH D': { opcode: 0xD5, bytes: 1, type: 'simple' },
  'PUSH H': { opcode: 0xE5, bytes: 1, type: 'simple' },
  'PUSH PSW': { opcode: 0xF5, bytes: 1, type: 'simple' },
  'POP B': { opcode: 0xC1, bytes: 1, type: 'simple' },
  'POP D': { opcode: 0xD1, bytes: 1, type: 'simple' },
  'POP H': { opcode: 0xE1, bytes: 1, type: 'simple' },
  'POP PSW': { opcode: 0xF1, bytes: 1, type: 'simple' },
  'XTHL': { opcode: 0xE3, bytes: 1, type: 'simple' },
  'SPHL': { opcode: 0xF9, bytes: 1, type: 'simple' },

  // I/O Instructions
  'IN': { opcode: 0xDB, bytes: 2, type: 'immediate' },
  'OUT': { opcode: 0xD3, bytes: 2, type: 'immediate' },

  // Control Instructions
  'NOP': { opcode: 0x00, bytes: 1, type: 'simple' },
  'HLT': { opcode: 0x76, bytes: 1, type: 'simple' },
  'DI': { opcode: 0xF3, bytes: 1, type: 'simple' },
  'EI': { opcode: 0xFB, bytes: 1, type: 'simple' },
  'RIM': { opcode: 0x20, bytes: 1, type: 'simple' },
  'SIM': { opcode: 0x30, bytes: 1, type: 'simple' },
}

// Parse a numeric value (hex, binary, decimal)
function parseNumber(str: string): number | null {
  str = str.trim().toUpperCase()
  
  // Hex format: 0xFF, FFH, 0XFF
  if (str.endsWith('H')) {
    const hex = parseInt(str.slice(0, -1), 16)
    return isNaN(hex) ? null : hex
  }
  if (str.startsWith('0X')) {
    const hex = parseInt(str.slice(2), 16)
    return isNaN(hex) ? null : hex
  }
  
  // Binary format: 10101010B
  if (str.endsWith('B')) {
    const bin = parseInt(str.slice(0, -1), 2)
    return isNaN(bin) ? null : bin
  }
  
  // Decimal
  const dec = parseInt(str, 10)
  return isNaN(dec) ? null : dec
}

export function assemble(sourceCode: string): AssemblerResult {
  const lines = sourceCode.split('\n')
  const errors: AssemblerError[] = []
  const symbols = new Map<string, number>()
  const instructions: AssembledInstruction[] = []
  let currentAddress = 0x0000
  let startAddress = 0x0000
  let hasOrg = false

  // First pass: collect labels and calculate addresses
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim()
    const lineNum = i + 1

    // Remove comments
    const commentIndex = line.indexOf(';')
    if (commentIndex !== -1) {
      line = line.substring(0, commentIndex).trim()
    }

    if (!line) continue

    // Check for ORG directive
    if (line.toUpperCase().startsWith('ORG')) {
      const parts = line.split(/\s+/)
      if (parts.length >= 2) {
        const addr = parseNumber(parts[1])
        if (addr !== null) {
          currentAddress = addr & 0xFFFF
          if (!hasOrg) {
            startAddress = currentAddress
            hasOrg = true
          }
        } else {
          errors.push({ line: lineNum, message: `Dirección ORG inválida: ${parts[1]}`, type: 'error' })
        }
      }
      continue
    }

    // Check for END directive
    if (line.toUpperCase().startsWith('END')) {
      break
    }

    // Check for label
    const labelMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*):(.*)$/)
    if (labelMatch) {
      const label = labelMatch[1].toUpperCase()
      if (symbols.has(label)) {
        errors.push({ line: lineNum, message: `Etiqueta duplicada: ${label}`, type: 'error' })
      } else {
        symbols.set(label, currentAddress)
      }
      line = labelMatch[2].trim()
      if (!line) continue
    }

    // Check for DB directive
    if (line.toUpperCase().startsWith('DB')) {
      const data = line.substring(2).trim()
      const values = data.split(',')
      for (const val of values) {
        const trimmed = val.trim()
        if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
          // String
          const str = trimmed.slice(1, -1)
          currentAddress += str.length
        } else {
          currentAddress += 1
        }
      }
      continue
    }

    // Check for DW directive
    if (line.toUpperCase().startsWith('DW')) {
      const data = line.substring(2).trim()
      const values = data.split(',')
      currentAddress += values.length * 2
      continue
    }

    // Check for DS directive (define space)
    if (line.toUpperCase().startsWith('DS')) {
      const size = parseNumber(line.substring(2).trim())
      if (size !== null) {
        currentAddress += size
      }
      continue
    }

    // Check for EQU directive
    if (line.toUpperCase().includes(' EQU ')) {
      const parts = line.split(/\s+EQU\s+/i)
      if (parts.length === 2) {
        const name = parts[0].trim().toUpperCase()
        const value = parseNumber(parts[1].trim())
        if (value !== null) {
          symbols.set(name, value)
        }
      }
      continue
    }

    // Normalize: remove spaces after commas for consistent matching
    const normalizedLine = line.replace(/,\s*/g, ',')
    const upperLine = normalizedLine.toUpperCase()
    let foundInstruction = false

    for (const [key, info] of Object.entries(INSTRUCTIONS)) {
      if (upperLine === key || upperLine.startsWith(key + ' ') || upperLine.startsWith(key + ',')) {
        currentAddress += info.bytes
        foundInstruction = true
        break
      }
    }

    if (!foundInstruction) {
      // Try matching instruction with operand
      const parts = normalizedLine.toUpperCase().split(/[,\s]+/)
      const mnemonic = parts[0]
      
      // Check for instructions that take operands
      const instructionKeys = Object.keys(INSTRUCTIONS).filter(k => k.startsWith(mnemonic + ' ') || k === mnemonic)
      
      if (instructionKeys.length > 0) {
        const info = INSTRUCTIONS[instructionKeys[0]]
        if (info) {
          currentAddress += info.bytes
          foundInstruction = true
        }
      } else {
        // Check for single-word instructions
        const info = INSTRUCTIONS[mnemonic]
        if (info) {
          currentAddress += info.bytes
          foundInstruction = true
        }
      }
    }

    if (!foundInstruction && line) {
      errors.push({ line: lineNum, message: `Instrucción desconocida: ${line}`, type: 'error' })
    }
  }

  // Second pass: generate machine code
  currentAddress = startAddress
  const machineCode: number[] = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim()
    const lineNum = i + 1

    // Remove comments
    const commentIndex = line.indexOf(';')
    if (commentIndex !== -1) {
      line = line.substring(0, commentIndex).trim()
    }

    if (!line) continue

    // Check for ORG directive
    if (line.toUpperCase().startsWith('ORG')) {
      const parts = line.split(/\s+/)
      if (parts.length >= 2) {
        const addr = parseNumber(parts[1])
        if (addr !== null) {
          currentAddress = addr & 0xFFFF
        }
      }
      continue
    }

    // Check for END directive
    if (line.toUpperCase().startsWith('END')) {
      break
    }

    // Skip EQU directives
    if (line.toUpperCase().includes(' EQU ')) {
      continue
    }

    // Check for label and remove it
    let label: string | undefined
    const labelMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*):(.*)$/)
    if (labelMatch) {
      label = labelMatch[1].toUpperCase()
      line = labelMatch[2].trim()
      if (!line) continue
    }

    // Handle DB directive
    if (line.toUpperCase().startsWith('DB')) {
      const data = line.substring(2).trim()
      const values = data.split(',')
      const bytes: number[] = []
      
      for (const val of values) {
        const trimmed = val.trim()
        if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
          const str = trimmed.slice(1, -1)
          for (const char of str) {
            bytes.push(char.charCodeAt(0))
          }
        } else {
          const num = parseNumber(trimmed) ?? symbols.get(trimmed.toUpperCase())
          if (num !== undefined) {
            bytes.push(num & 0xFF)
          }
        }
      }
      
      instructions.push({
        address: currentAddress,
        bytes,
        label,
        instruction: line,
        line: lineNum,
      })
      
      machineCode.push(...bytes)
      currentAddress += bytes.length
      continue
    }

    // Handle DW directive
    if (line.toUpperCase().startsWith('DW')) {
      const data = line.substring(2).trim()
      const values = data.split(',')
      const bytes: number[] = []
      
      for (const val of values) {
        const trimmed = val.trim()
        const num = parseNumber(trimmed) ?? symbols.get(trimmed.toUpperCase())
        if (num !== undefined) {
          bytes.push(num & 0xFF)
          bytes.push((num >> 8) & 0xFF)
        }
      }
      
      instructions.push({
        address: currentAddress,
        bytes,
        label,
        instruction: line,
        line: lineNum,
      })
      
      machineCode.push(...bytes)
      currentAddress += bytes.length
      continue
    }

    // Handle DS directive
    if (line.toUpperCase().startsWith('DS')) {
      const size = parseNumber(line.substring(2).trim())
      if (size !== null) {
        const bytes = new Array(size).fill(0)
        instructions.push({
          address: currentAddress,
          bytes,
          label,
          instruction: line,
          line: lineNum,
        })
        machineCode.push(...bytes)
        currentAddress += size
      }
      continue
    }

    // Normalize: remove spaces after commas for consistent matching
    const normalizedLine = line.replace(/,\s*/g, ',')
    const upperLine = normalizedLine.toUpperCase()
    let foundInstruction = false

    for (const [key, info] of Object.entries(INSTRUCTIONS)) {
      if (upperLine === key) {
        // Simple instruction with no additional operand
        const bytes = [info.opcode]
        instructions.push({
          address: currentAddress,
          bytes,
          label,
          instruction: line,
          line: lineNum,
        })
        machineCode.push(...bytes)
        currentAddress += info.bytes
        foundInstruction = true
        break
      }
      
      if (upperLine.startsWith(key + ' ') || upperLine.startsWith(key + ',')) {
        // Instruction with operand
        const operandStr = upperLine.substring(key.length).replace(/^[,\s]+/, '').trim()
        const bytes = [info.opcode]

        if (info.type === 'immediate') {
          const value = parseNumber(operandStr) ?? symbols.get(operandStr)
          if (value !== undefined) {
            bytes.push(value & 0xFF)
          } else {
            errors.push({ line: lineNum, message: `Valor inmediato inválido: ${operandStr}`, type: 'error' })
            bytes.push(0)
          }
        } else if (info.type === 'immediate16' || info.type === 'address') {
          let value = parseNumber(operandStr) ?? symbols.get(operandStr)
          if (value !== undefined) {
            bytes.push(value & 0xFF)
            bytes.push((value >> 8) & 0xFF)
          } else {
            errors.push({ line: lineNum, message: `Dirección/valor inválido: ${operandStr}`, type: 'error' })
            bytes.push(0, 0)
          }
        }

        instructions.push({
          address: currentAddress,
          bytes,
          label,
          instruction: line,
          line: lineNum,
        })
        machineCode.push(...bytes)
        currentAddress += info.bytes
        foundInstruction = true
        break
      }
    }

    if (!foundInstruction) {
      // Try matching single-operand instructions
      const parts = upperLine.split(/[,\s]+/)
      const mnemonic = parts[0]
      const operand = parts.slice(1).join(',')

      const info = INSTRUCTIONS[mnemonic]
      if (info) {
        const bytes = [info.opcode]

        if (info.type === 'immediate' && operand) {
          const value = parseNumber(operand) ?? symbols.get(operand)
          if (value !== undefined) {
            bytes.push(value & 0xFF)
          } else {
            bytes.push(0)
          }
        } else if ((info.type === 'immediate16' || info.type === 'address') && operand) {
          const value = parseNumber(operand) ?? symbols.get(operand)
          if (value !== undefined) {
            bytes.push(value & 0xFF)
            bytes.push((value >> 8) & 0xFF)
          } else {
            bytes.push(0, 0)
          }
        }

        instructions.push({
          address: currentAddress,
          bytes,
          label,
          instruction: line,
          line: lineNum,
        })
        machineCode.push(...bytes)
        currentAddress += info.bytes
        foundInstruction = true
      }
    }
  }

  return {
    success: errors.filter(e => e.type === 'error').length === 0,
    machineCode,
    instructions,
    symbols,
    errors,
    startAddress,
  }
}

export function getInstructionInfo(mnemonic: string): { opcode: number; bytes: number; type: string } | null {
  return INSTRUCTIONS[mnemonic.toUpperCase()] || null
}

export function getAllInstructions(): string[] {
  return Object.keys(INSTRUCTIONS).sort()
}
