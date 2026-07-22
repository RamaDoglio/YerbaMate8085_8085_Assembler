// Intel 8085 CPU Emulator

export interface CPUState {
  // 8-bit registers
  A: number
  B: number
  C: number
  D: number
  E: number
  H: number
  L: number

  // 16-bit registers
  SP: number // Stack Pointer
  PC: number // Program Counter

  // Flags (stored in PSW with A)
  flags: {
    S: boolean  // Sign
    Z: boolean  // Zero
    AC: boolean // Auxiliary Carry
    P: boolean  // Parity
    CY: boolean // Carry
  }

  // Status
  halted: boolean
  interruptEnabled: boolean
  serialInputData: boolean  // SID
  serialOutputData: boolean // SOD
  interruptMask: number     // bits 0-2: RST 5.5, 6.5, 7.5 masks
  inputPorts: Record<number, number>   // IN ports buffer (user-provided values)
  outputPorts: Record<number, number>  // OUT ports buffer (written values)
}

export interface ExecutionResult {
  success: boolean
  error?: string
  cyclesUsed: number
}

export class CPU8085 {
  private memory: Uint8Array
  private state: CPUState

  constructor() {
    this.memory = new Uint8Array(65536) // 64KB
    this.state = this.createInitialState()
  }

  private createInitialState(): CPUState {
    return {
      A: 0x00,
      B: 0x00,
      C: 0x00,
      D: 0x00,
      E: 0x00,
      H: 0x00,
      L: 0x00,
      SP: 0xFFFF,
      PC: 0x0000,
      flags: {
        S: false,
        Z: false,
        AC: false,
        P: false,
        CY: false,
      },
      halted: false,
      interruptEnabled: false,
      serialInputData: false,
      serialOutputData: false,
      interruptMask: 0x07,
      inputPorts: {},
      outputPorts: {},
    }
  }

  reset(): void {
    this.state = this.createInitialState()
    this.memory.fill(0)
  }

  getState(): CPUState {
    return { ...this.state, flags: { ...this.state.flags } }
  }

  getMemory(): Uint8Array {
    return this.memory
  }

  setPC(address: number): void {
    this.state.PC = address & 0xFFFF
  }

  loadProgram(machineCode: number[], startAddress: number = 0x0000): void {
    for (let i = 0; i < machineCode.length; i++) {
      this.memory[(startAddress + i) & 0xFFFF] = machineCode[i] & 0xFF
    }
  }

  readMemory(address: number): number {
    return this.memory[address & 0xFFFF]
  }

  writeMemory(address: number, value: number): void {
    this.memory[address & 0xFFFF] = value & 0xFF
  }

  setInputPort(port: number, value: number): void {
    this.state.inputPorts[port] = value & 0xFF
  }

  getOutputPorts(): Record<number, number> {
    return { ...this.state.outputPorts }
  }

  // Get 16-bit register pairs
  getBC(): number {
    return (this.state.B << 8) | this.state.C
  }

  getDE(): number {
    return (this.state.D << 8) | this.state.E
  }

  getHL(): number {
    return (this.state.H << 8) | this.state.L
  }

  setBC(value: number): void {
    this.state.B = (value >> 8) & 0xFF
    this.state.C = value & 0xFF
  }

  setDE(value: number): void {
    this.state.D = (value >> 8) & 0xFF
    this.state.E = value & 0xFF
  }

  setHL(value: number): void {
    this.state.H = (value >> 8) & 0xFF
    this.state.L = value & 0xFF
  }

  // Flag helpers
  private updateFlags(result: number, auxCarry: boolean = false): void {
    const byte = result & 0xFF
    this.state.flags.Z = byte === 0
    this.state.flags.S = (byte & 0x80) !== 0
    this.state.flags.P = this.calculateParity(byte)
    this.state.flags.AC = auxCarry
    this.state.flags.CY = result > 0xFF || result < 0
  }

  private calculateParity(value: number): boolean {
    let ones = 0
    for (let i = 0; i < 8; i++) {
      if ((value >> i) & 1) ones++
    }
    return ones % 2 === 0
  }

  // Read next byte from memory and increment PC
  private fetchByte(): number {
    const value = this.memory[this.state.PC]
    this.state.PC = (this.state.PC + 1) & 0xFFFF
    return value
  }

  // Read next word from memory (little-endian) and increment PC
  private fetchWord(): number {
    const low = this.fetchByte()
    const high = this.fetchByte()
    return (high << 8) | low
  }

  // Push word onto stack
  private pushWord(value: number): void {
    this.state.SP = (this.state.SP - 1) & 0xFFFF
    this.memory[this.state.SP] = (value >> 8) & 0xFF
    this.state.SP = (this.state.SP - 1) & 0xFFFF
    this.memory[this.state.SP] = value & 0xFF
  }

  // Pop word from stack
  private popWord(): number {
    const low = this.memory[this.state.SP]
    this.state.SP = (this.state.SP + 1) & 0xFFFF
    const high = this.memory[this.state.SP]
    this.state.SP = (this.state.SP + 1) & 0xFFFF
    return (high << 8) | low
  }

  // Get PSW (A and flags as 16-bit value)
  private getPSW(): number {
    let flags = 0
    if (this.state.flags.S) flags |= 0x80
    if (this.state.flags.Z) flags |= 0x40
    if (this.state.flags.AC) flags |= 0x10
    if (this.state.flags.P) flags |= 0x04
    flags |= 0x02 // Bit 1 is always 1
    if (this.state.flags.CY) flags |= 0x01
    return (this.state.A << 8) | flags
  }

  private setPSW(value: number): void {
    this.state.A = (value >> 8) & 0xFF
    const flags = value & 0xFF
    this.state.flags.S = (flags & 0x80) !== 0
    this.state.flags.Z = (flags & 0x40) !== 0
    this.state.flags.AC = (flags & 0x10) !== 0
    this.state.flags.P = (flags & 0x04) !== 0
    this.state.flags.CY = (flags & 0x01) !== 0
  }

  // Execute single instruction
  step(): ExecutionResult {
    if (this.state.halted) {
      return { success: true, cyclesUsed: 0 }
    }

    const opcode = this.fetchByte()
    let cycles = 4

    try {
      switch (opcode) {
        // NOP
        case 0x00:
          break

        // LXI B, d16
        case 0x01:
          this.setBC(this.fetchWord())
          cycles = 10
          break

        // STAX B
        case 0x02:
          this.memory[this.getBC()] = this.state.A
          cycles = 7
          break

        // INX B
        case 0x03:
          this.setBC((this.getBC() + 1) & 0xFFFF)
          cycles = 6
          break

        // INR B
        case 0x04:
          {
            const auxCarry = (this.state.B & 0x0F) === 0x0F
            this.state.B = (this.state.B + 1) & 0xFF
            this.updateFlags(this.state.B, auxCarry)
          }
          cycles = 4
          break

        // DCR B
        case 0x05:
          {
            const auxCarry = (this.state.B & 0x0F) === 0x00
            this.state.B = (this.state.B - 1) & 0xFF
            this.updateFlags(this.state.B, auxCarry)
          }
          cycles = 4
          break

        // MVI B, d8
        case 0x06:
          this.state.B = this.fetchByte()
          cycles = 7
          break

        // RLC
        case 0x07:
          this.state.flags.CY = (this.state.A & 0x80) !== 0
          this.state.A = ((this.state.A << 1) | (this.state.A >> 7)) & 0xFF
          cycles = 4
          break

        // DAD B
        case 0x09:
          {
            const result = this.getHL() + this.getBC()
            this.state.flags.CY = result > 0xFFFF
            this.setHL(result & 0xFFFF)
          }
          cycles = 10
          break

        // LDAX B
        case 0x0A:
          this.state.A = this.memory[this.getBC()]
          cycles = 7
          break

        // DCX B
        case 0x0B:
          this.setBC((this.getBC() - 1) & 0xFFFF)
          cycles = 6
          break

        // INR C
        case 0x0C:
          {
            const auxCarry = (this.state.C & 0x0F) === 0x0F
            this.state.C = (this.state.C + 1) & 0xFF
            this.updateFlags(this.state.C, auxCarry)
          }
          cycles = 4
          break

        // DCR C
        case 0x0D:
          {
            const auxCarry = (this.state.C & 0x0F) === 0x00
            this.state.C = (this.state.C - 1) & 0xFF
            this.updateFlags(this.state.C, auxCarry)
          }
          cycles = 4
          break

        // MVI C, d8
        case 0x0E:
          this.state.C = this.fetchByte()
          cycles = 7
          break

        // RRC
        case 0x0F:
          this.state.flags.CY = (this.state.A & 0x01) !== 0
          this.state.A = ((this.state.A >> 1) | (this.state.A << 7)) & 0xFF
          cycles = 4
          break

        // LXI D, d16
        case 0x11:
          this.setDE(this.fetchWord())
          cycles = 10
          break

        // STAX D
        case 0x12:
          this.memory[this.getDE()] = this.state.A
          cycles = 7
          break

        // INX D
        case 0x13:
          this.setDE((this.getDE() + 1) & 0xFFFF)
          cycles = 6
          break

        // INR D
        case 0x14:
          {
            const auxCarry = (this.state.D & 0x0F) === 0x0F
            this.state.D = (this.state.D + 1) & 0xFF
            this.updateFlags(this.state.D, auxCarry)
          }
          cycles = 4
          break

        // DCR D
        case 0x15:
          {
            const auxCarry = (this.state.D & 0x0F) === 0x00
            this.state.D = (this.state.D - 1) & 0xFF
            this.updateFlags(this.state.D, auxCarry)
          }
          cycles = 4
          break

        // MVI D, d8
        case 0x16:
          this.state.D = this.fetchByte()
          cycles = 7
          break

        // RAL
        case 0x17:
          {
            const carry = this.state.flags.CY ? 1 : 0
            this.state.flags.CY = (this.state.A & 0x80) !== 0
            this.state.A = ((this.state.A << 1) | carry) & 0xFF
          }
          cycles = 4
          break

        // DAD D
        case 0x19:
          {
            const result = this.getHL() + this.getDE()
            this.state.flags.CY = result > 0xFFFF
            this.setHL(result & 0xFFFF)
          }
          cycles = 10
          break

        // LDAX D
        case 0x1A:
          this.state.A = this.memory[this.getDE()]
          cycles = 7
          break

        // DCX D
        case 0x1B:
          this.setDE((this.getDE() - 1) & 0xFFFF)
          cycles = 6
          break

        // INR E
        case 0x1C:
          {
            const auxCarry = (this.state.E & 0x0F) === 0x0F
            this.state.E = (this.state.E + 1) & 0xFF
            this.updateFlags(this.state.E, auxCarry)
          }
          cycles = 4
          break

        // DCR E
        case 0x1D:
          {
            const auxCarry = (this.state.E & 0x0F) === 0x00
            this.state.E = (this.state.E - 1) & 0xFF
            this.updateFlags(this.state.E, auxCarry)
          }
          cycles = 4
          break

        // MVI E, d8
        case 0x1E:
          this.state.E = this.fetchByte()
          cycles = 7
          break

        // RAR
        case 0x1F:
          {
            const carry = this.state.flags.CY ? 0x80 : 0
            this.state.flags.CY = (this.state.A & 0x01) !== 0
            this.state.A = ((this.state.A >> 1) | carry) & 0xFF
          }
          cycles = 4
          break

        // RIM - Read Interrupt Mask
        case 0x20:
          {
            let rim = 0
            // Bits 0-2: masks for RST 5.5, 6.5, 7.5
            rim |= this.state.interruptMask & 0x07
            // Bit 3: IE flag
            if (this.state.interruptEnabled) rim |= 0x08
            // Bits 4-6: pending interrupts (simplified: none pending)
            // Bit 7: SID
            if (this.state.serialInputData) rim |= 0x80
            this.state.A = rim
          }
          cycles = 4
          break

        // LXI H, d16
        case 0x21:
          this.setHL(this.fetchWord())
          cycles = 10
          break

        // SHLD addr
        case 0x22:
          {
            const addr = this.fetchWord()
            this.memory[addr] = this.state.L
            this.memory[(addr + 1) & 0xFFFF] = this.state.H
          }
          cycles = 16
          break

        // INX H
        case 0x23:
          this.setHL((this.getHL() + 1) & 0xFFFF)
          cycles = 6
          break

        // INR H
        case 0x24:
          {
            const auxCarry = (this.state.H & 0x0F) === 0x0F
            this.state.H = (this.state.H + 1) & 0xFF
            this.updateFlags(this.state.H, auxCarry)
          }
          cycles = 4
          break

        // DCR H
        case 0x25:
          {
            const auxCarry = (this.state.H & 0x0F) === 0x00
            this.state.H = (this.state.H - 1) & 0xFF
            this.updateFlags(this.state.H, auxCarry)
          }
          cycles = 4
          break

        // MVI H, d8
        case 0x26:
          this.state.H = this.fetchByte()
          cycles = 7
          break

        // DAA
        case 0x27:
          {
            let value = this.state.A
            if ((value & 0x0F) > 9 || this.state.flags.AC) {
              value += 6
            }
            if (((value >> 4) & 0x0F) > 9 || this.state.flags.CY) {
              value += 0x60
              this.state.flags.CY = true
            }
            this.state.A = value & 0xFF
            this.updateFlags(this.state.A, this.state.flags.AC)
          }
          cycles = 4
          break

        // DAD H
        case 0x29:
          {
            const result = this.getHL() + this.getHL()
            this.state.flags.CY = result > 0xFFFF
            this.setHL(result & 0xFFFF)
          }
          cycles = 10
          break

        // LHLD addr
        case 0x2A:
          {
            const addr = this.fetchWord()
            this.state.L = this.memory[addr]
            this.state.H = this.memory[(addr + 1) & 0xFFFF]
          }
          cycles = 16
          break

        // DCX H
        case 0x2B:
          this.setHL((this.getHL() - 1) & 0xFFFF)
          cycles = 6
          break

        // INR L
        case 0x2C:
          {
            const auxCarry = (this.state.L & 0x0F) === 0x0F
            this.state.L = (this.state.L + 1) & 0xFF
            this.updateFlags(this.state.L, auxCarry)
          }
          cycles = 4
          break

        // DCR L
        case 0x2D:
          {
            const auxCarry = (this.state.L & 0x0F) === 0x00
            this.state.L = (this.state.L - 1) & 0xFF
            this.updateFlags(this.state.L, auxCarry)
          }
          cycles = 4
          break

        // MVI L, d8
        case 0x2E:
          this.state.L = this.fetchByte()
          cycles = 7
          break

        // CMA
        case 0x2F:
          this.state.A = (~this.state.A) & 0xFF
          cycles = 4
          break

        // SIM - Set Interrupt Mask
        case 0x30:
          {
            const sim = this.state.A
            // Bit 3 (MSE): mask set enable
            if (sim & 0x08) {
              // Bits 0-2: masks for RST 5.5, 6.5, 7.5
              this.state.interruptMask = sim & 0x07
            }
            // Bit 4: reset RST 7.5 (simplified)
            // Bit 6 (SOE): serial output enable
            if (sim & 0x40) {
              // Bit 7: SOD
              this.state.serialOutputData = (sim & 0x80) !== 0
            }
          }
          cycles = 4
          break

        // LXI SP, d16
        case 0x31:
          this.state.SP = this.fetchWord()
          cycles = 10
          break

        // STA addr
        case 0x32:
          this.memory[this.fetchWord()] = this.state.A
          cycles = 13
          break

        // INX SP
        case 0x33:
          this.state.SP = (this.state.SP + 1) & 0xFFFF
          cycles = 6
          break

        // INR M
        case 0x34:
          {
            const addr = this.getHL()
            const auxCarry = (this.memory[addr] & 0x0F) === 0x0F
            this.memory[addr] = (this.memory[addr] + 1) & 0xFF
            this.updateFlags(this.memory[addr], auxCarry)
          }
          cycles = 10
          break

        // DCR M
        case 0x35:
          {
            const addr = this.getHL()
            const auxCarry = (this.memory[addr] & 0x0F) === 0x00
            this.memory[addr] = (this.memory[addr] - 1) & 0xFF
            this.updateFlags(this.memory[addr], auxCarry)
          }
          cycles = 10
          break

        // MVI M, d8
        case 0x36:
          this.memory[this.getHL()] = this.fetchByte()
          cycles = 10
          break

        // STC
        case 0x37:
          this.state.flags.CY = true
          cycles = 4
          break

        // DAD SP
        case 0x39:
          {
            const result = this.getHL() + this.state.SP
            this.state.flags.CY = result > 0xFFFF
            this.setHL(result & 0xFFFF)
          }
          cycles = 10
          break

        // LDA addr
        case 0x3A:
          this.state.A = this.memory[this.fetchWord()]
          cycles = 13
          break

        // DCX SP
        case 0x3B:
          this.state.SP = (this.state.SP - 1) & 0xFFFF
          cycles = 6
          break

        // INR A
        case 0x3C:
          {
            const auxCarry = (this.state.A & 0x0F) === 0x0F
            this.state.A = (this.state.A + 1) & 0xFF
            this.updateFlags(this.state.A, auxCarry)
          }
          cycles = 4
          break

        // DCR A
        case 0x3D:
          {
            const auxCarry = (this.state.A & 0x0F) === 0x00
            this.state.A = (this.state.A - 1) & 0xFF
            this.updateFlags(this.state.A, auxCarry)
          }
          cycles = 4
          break

        // MVI A, d8
        case 0x3E:
          this.state.A = this.fetchByte()
          cycles = 7
          break

        // CMC
        case 0x3F:
          this.state.flags.CY = !this.state.flags.CY
          cycles = 4
          break

        // MOV B,B through MOV M,A (0x40-0x77 except 0x76)
        case 0x40: this.state.B = this.state.B; break
        case 0x41: this.state.B = this.state.C; break
        case 0x42: this.state.B = this.state.D; break
        case 0x43: this.state.B = this.state.E; break
        case 0x44: this.state.B = this.state.H; break
        case 0x45: this.state.B = this.state.L; break
        case 0x46: this.state.B = this.memory[this.getHL()]; cycles = 7; break
        case 0x47: this.state.B = this.state.A; break

        case 0x48: this.state.C = this.state.B; break
        case 0x49: this.state.C = this.state.C; break
        case 0x4A: this.state.C = this.state.D; break
        case 0x4B: this.state.C = this.state.E; break
        case 0x4C: this.state.C = this.state.H; break
        case 0x4D: this.state.C = this.state.L; break
        case 0x4E: this.state.C = this.memory[this.getHL()]; cycles = 7; break
        case 0x4F: this.state.C = this.state.A; break

        case 0x50: this.state.D = this.state.B; break
        case 0x51: this.state.D = this.state.C; break
        case 0x52: this.state.D = this.state.D; break
        case 0x53: this.state.D = this.state.E; break
        case 0x54: this.state.D = this.state.H; break
        case 0x55: this.state.D = this.state.L; break
        case 0x56: this.state.D = this.memory[this.getHL()]; cycles = 7; break
        case 0x57: this.state.D = this.state.A; break

        case 0x58: this.state.E = this.state.B; break
        case 0x59: this.state.E = this.state.C; break
        case 0x5A: this.state.E = this.state.D; break
        case 0x5B: this.state.E = this.state.E; break
        case 0x5C: this.state.E = this.state.H; break
        case 0x5D: this.state.E = this.state.L; break
        case 0x5E: this.state.E = this.memory[this.getHL()]; cycles = 7; break
        case 0x5F: this.state.E = this.state.A; break

        case 0x60: this.state.H = this.state.B; break
        case 0x61: this.state.H = this.state.C; break
        case 0x62: this.state.H = this.state.D; break
        case 0x63: this.state.H = this.state.E; break
        case 0x64: this.state.H = this.state.H; break
        case 0x65: this.state.H = this.state.L; break
        case 0x66: this.state.H = this.memory[this.getHL()]; cycles = 7; break
        case 0x67: this.state.H = this.state.A; break

        case 0x68: this.state.L = this.state.B; break
        case 0x69: this.state.L = this.state.C; break
        case 0x6A: this.state.L = this.state.D; break
        case 0x6B: this.state.L = this.state.E; break
        case 0x6C: this.state.L = this.state.H; break
        case 0x6D: this.state.L = this.state.L; break
        case 0x6E: this.state.L = this.memory[this.getHL()]; cycles = 7; break
        case 0x6F: this.state.L = this.state.A; break

        case 0x70: this.memory[this.getHL()] = this.state.B; cycles = 7; break
        case 0x71: this.memory[this.getHL()] = this.state.C; cycles = 7; break
        case 0x72: this.memory[this.getHL()] = this.state.D; cycles = 7; break
        case 0x73: this.memory[this.getHL()] = this.state.E; cycles = 7; break
        case 0x74: this.memory[this.getHL()] = this.state.H; cycles = 7; break
        case 0x75: this.memory[this.getHL()] = this.state.L; cycles = 7; break

        // HLT
        case 0x76:
          this.state.halted = true
          cycles = 5
          break

        case 0x77: this.memory[this.getHL()] = this.state.A; cycles = 7; break

        case 0x78: this.state.A = this.state.B; break
        case 0x79: this.state.A = this.state.C; break
        case 0x7A: this.state.A = this.state.D; break
        case 0x7B: this.state.A = this.state.E; break
        case 0x7C: this.state.A = this.state.H; break
        case 0x7D: this.state.A = this.state.L; break
        case 0x7E: this.state.A = this.memory[this.getHL()]; cycles = 7; break
        case 0x7F: this.state.A = this.state.A; break

        // ADD instructions (0x80-0x87)
        case 0x80: this.add(this.state.B); break
        case 0x81: this.add(this.state.C); break
        case 0x82: this.add(this.state.D); break
        case 0x83: this.add(this.state.E); break
        case 0x84: this.add(this.state.H); break
        case 0x85: this.add(this.state.L); break
        case 0x86: this.add(this.memory[this.getHL()]); cycles = 7; break
        case 0x87: this.add(this.state.A); break

        // ADC instructions (0x88-0x8F)
        case 0x88: this.adc(this.state.B); break
        case 0x89: this.adc(this.state.C); break
        case 0x8A: this.adc(this.state.D); break
        case 0x8B: this.adc(this.state.E); break
        case 0x8C: this.adc(this.state.H); break
        case 0x8D: this.adc(this.state.L); break
        case 0x8E: this.adc(this.memory[this.getHL()]); cycles = 7; break
        case 0x8F: this.adc(this.state.A); break

        // SUB instructions (0x90-0x97)
        case 0x90: this.sub(this.state.B); break
        case 0x91: this.sub(this.state.C); break
        case 0x92: this.sub(this.state.D); break
        case 0x93: this.sub(this.state.E); break
        case 0x94: this.sub(this.state.H); break
        case 0x95: this.sub(this.state.L); break
        case 0x96: this.sub(this.memory[this.getHL()]); cycles = 7; break
        case 0x97: this.sub(this.state.A); break

        // SBB instructions (0x98-0x9F)
        case 0x98: this.sbb(this.state.B); break
        case 0x99: this.sbb(this.state.C); break
        case 0x9A: this.sbb(this.state.D); break
        case 0x9B: this.sbb(this.state.E); break
        case 0x9C: this.sbb(this.state.H); break
        case 0x9D: this.sbb(this.state.L); break
        case 0x9E: this.sbb(this.memory[this.getHL()]); cycles = 7; break
        case 0x9F: this.sbb(this.state.A); break

        // ANA instructions (0xA0-0xA7)
        case 0xA0: this.ana(this.state.B); break
        case 0xA1: this.ana(this.state.C); break
        case 0xA2: this.ana(this.state.D); break
        case 0xA3: this.ana(this.state.E); break
        case 0xA4: this.ana(this.state.H); break
        case 0xA5: this.ana(this.state.L); break
        case 0xA6: this.ana(this.memory[this.getHL()]); cycles = 7; break
        case 0xA7: this.ana(this.state.A); break

        // XRA instructions (0xA8-0xAF)
        case 0xA8: this.xra(this.state.B); break
        case 0xA9: this.xra(this.state.C); break
        case 0xAA: this.xra(this.state.D); break
        case 0xAB: this.xra(this.state.E); break
        case 0xAC: this.xra(this.state.H); break
        case 0xAD: this.xra(this.state.L); break
        case 0xAE: this.xra(this.memory[this.getHL()]); cycles = 7; break
        case 0xAF: this.xra(this.state.A); break

        // ORA instructions (0xB0-0xB7)
        case 0xB0: this.ora(this.state.B); break
        case 0xB1: this.ora(this.state.C); break
        case 0xB2: this.ora(this.state.D); break
        case 0xB3: this.ora(this.state.E); break
        case 0xB4: this.ora(this.state.H); break
        case 0xB5: this.ora(this.state.L); break
        case 0xB6: this.ora(this.memory[this.getHL()]); cycles = 7; break
        case 0xB7: this.ora(this.state.A); break

        // CMP instructions (0xB8-0xBF)
        case 0xB8: this.cmp(this.state.B); break
        case 0xB9: this.cmp(this.state.C); break
        case 0xBA: this.cmp(this.state.D); break
        case 0xBB: this.cmp(this.state.E); break
        case 0xBC: this.cmp(this.state.H); break
        case 0xBD: this.cmp(this.state.L); break
        case 0xBE: this.cmp(this.memory[this.getHL()]); cycles = 7; break
        case 0xBF: this.cmp(this.state.A); break

        // RNZ
        case 0xC0:
          if (!this.state.flags.Z) {
            this.state.PC = this.popWord()
            cycles = 12
          } else {
            cycles = 6
          }
          break

        // POP B
        case 0xC1:
          this.setBC(this.popWord())
          cycles = 10
          break

        // JNZ addr
        case 0xC2:
          {
            const addr = this.fetchWord()
            if (!this.state.flags.Z) {
              this.state.PC = addr
            }
          }
          cycles = 10
          break

        // JMP addr
        case 0xC3:
          this.state.PC = this.fetchWord()
          cycles = 10
          break

        // CNZ addr
        case 0xC4:
          {
            const addr = this.fetchWord()
            if (!this.state.flags.Z) {
              this.pushWord(this.state.PC)
              this.state.PC = addr
              cycles = 18
            } else {
              cycles = 9
            }
          }
          break

        // PUSH B
        case 0xC5:
          this.pushWord(this.getBC())
          cycles = 12
          break

        // ADI d8
        case 0xC6:
          this.add(this.fetchByte())
          cycles = 7
          break

        // RST 0
        case 0xC7:
          this.pushWord(this.state.PC)
          this.state.PC = 0x0000
          cycles = 12
          break

        // RZ
        case 0xC8:
          if (this.state.flags.Z) {
            this.state.PC = this.popWord()
            cycles = 12
          } else {
            cycles = 6
          }
          break

        // RET
        case 0xC9:
          this.state.PC = this.popWord()
          cycles = 10
          break

        // JZ addr
        case 0xCA:
          {
            const addr = this.fetchWord()
            if (this.state.flags.Z) {
              this.state.PC = addr
            }
          }
          cycles = 10
          break

        // CZ addr
        case 0xCC:
          {
            const addr = this.fetchWord()
            if (this.state.flags.Z) {
              this.pushWord(this.state.PC)
              this.state.PC = addr
              cycles = 18
            } else {
              cycles = 9
            }
          }
          break

        // CALL addr
        case 0xCD:
          {
            const addr = this.fetchWord()
            this.pushWord(this.state.PC)
            this.state.PC = addr
          }
          cycles = 18
          break

        // ACI d8
        case 0xCE:
          this.adc(this.fetchByte())
          cycles = 7
          break

        // RST 1
        case 0xCF:
          this.pushWord(this.state.PC)
          this.state.PC = 0x0008
          cycles = 12
          break

        // RNC
        case 0xD0:
          if (!this.state.flags.CY) {
            this.state.PC = this.popWord()
            cycles = 12
          } else {
            cycles = 6
          }
          break

        // POP D
        case 0xD1:
          this.setDE(this.popWord())
          cycles = 10
          break

        // JNC addr
        case 0xD2:
          {
            const addr = this.fetchWord()
            if (!this.state.flags.CY) {
              this.state.PC = addr
            }
          }
          cycles = 10
          break

        // OUT d8
        case 0xD3:
          {
            const port = this.fetchByte()
            this.state.outputPorts[port] = this.state.A
          }
          cycles = 10
          break

        // CNC addr
        case 0xD4:
          {
            const addr = this.fetchWord()
            if (!this.state.flags.CY) {
              this.pushWord(this.state.PC)
              this.state.PC = addr
              cycles = 18
            } else {
              cycles = 9
            }
          }
          break

        // PUSH D
        case 0xD5:
          this.pushWord(this.getDE())
          cycles = 12
          break

        // SUI d8
        case 0xD6:
          this.sub(this.fetchByte())
          cycles = 7
          break

        // RST 2
        case 0xD7:
          this.pushWord(this.state.PC)
          this.state.PC = 0x0010
          cycles = 12
          break

        // RC
        case 0xD8:
          if (this.state.flags.CY) {
            this.state.PC = this.popWord()
            cycles = 12
          } else {
            cycles = 6
          }
          break

        // JC addr
        case 0xDA:
          {
            const addr = this.fetchWord()
            if (this.state.flags.CY) {
              this.state.PC = addr
            }
          }
          cycles = 10
          break

        // IN d8
        case 0xDB:
          {
            const port = this.fetchByte()
            this.state.A = this.state.inputPorts[port] ?? 0
          }
          cycles = 10
          break

        // CC addr
        case 0xDC:
          {
            const addr = this.fetchWord()
            if (this.state.flags.CY) {
              this.pushWord(this.state.PC)
              this.state.PC = addr
              cycles = 18
            } else {
              cycles = 9
            }
          }
          break

        // SBI d8
        case 0xDE:
          this.sbb(this.fetchByte())
          cycles = 7
          break

        // RST 3
        case 0xDF:
          this.pushWord(this.state.PC)
          this.state.PC = 0x0018
          cycles = 12
          break

        // RPO
        case 0xE0:
          if (!this.state.flags.P) {
            this.state.PC = this.popWord()
            cycles = 12
          } else {
            cycles = 6
          }
          break

        // POP H
        case 0xE1:
          this.setHL(this.popWord())
          cycles = 10
          break

        // JPO addr
        case 0xE2:
          {
            const addr = this.fetchWord()
            if (!this.state.flags.P) {
              this.state.PC = addr
            }
          }
          cycles = 10
          break

        // XTHL
        case 0xE3:
          {
            const temp = this.popWord()
            this.pushWord(this.getHL())
            this.setHL(temp)
          }
          cycles = 16
          break

        // CPO addr
        case 0xE4:
          {
            const addr = this.fetchWord()
            if (!this.state.flags.P) {
              this.pushWord(this.state.PC)
              this.state.PC = addr
              cycles = 18
            } else {
              cycles = 9
            }
          }
          break

        // PUSH H
        case 0xE5:
          this.pushWord(this.getHL())
          cycles = 12
          break

        // ANI d8
        case 0xE6:
          this.ana(this.fetchByte())
          cycles = 7
          break

        // RST 4
        case 0xE7:
          this.pushWord(this.state.PC)
          this.state.PC = 0x0020
          cycles = 12
          break

        // RPE
        case 0xE8:
          if (this.state.flags.P) {
            this.state.PC = this.popWord()
            cycles = 12
          } else {
            cycles = 6
          }
          break

        // PCHL
        case 0xE9:
          this.state.PC = this.getHL()
          cycles = 6
          break

        // JPE addr
        case 0xEA:
          {
            const addr = this.fetchWord()
            if (this.state.flags.P) {
              this.state.PC = addr
            }
          }
          cycles = 10
          break

        // XCHG
        case 0xEB:
          {
            const tempH = this.state.H
            const tempL = this.state.L
            this.state.H = this.state.D
            this.state.L = this.state.E
            this.state.D = tempH
            this.state.E = tempL
          }
          cycles = 4
          break

        // CPE addr
        case 0xEC:
          {
            const addr = this.fetchWord()
            if (this.state.flags.P) {
              this.pushWord(this.state.PC)
              this.state.PC = addr
              cycles = 18
            } else {
              cycles = 9
            }
          }
          break

        // XRI d8
        case 0xEE:
          this.xra(this.fetchByte())
          cycles = 7
          break

        // RST 5
        case 0xEF:
          this.pushWord(this.state.PC)
          this.state.PC = 0x0028
          cycles = 12
          break

        // RP
        case 0xF0:
          if (!this.state.flags.S) {
            this.state.PC = this.popWord()
            cycles = 12
          } else {
            cycles = 6
          }
          break

        // POP PSW
        case 0xF1:
          this.setPSW(this.popWord())
          cycles = 10
          break

        // JP addr
        case 0xF2:
          {
            const addr = this.fetchWord()
            if (!this.state.flags.S) {
              this.state.PC = addr
            }
          }
          cycles = 10
          break

        // DI
        case 0xF3:
          this.state.interruptEnabled = false
          cycles = 4
          break

        // CP addr
        case 0xF4:
          {
            const addr = this.fetchWord()
            if (!this.state.flags.S) {
              this.pushWord(this.state.PC)
              this.state.PC = addr
              cycles = 18
            } else {
              cycles = 9
            }
          }
          break

        // PUSH PSW
        case 0xF5:
          this.pushWord(this.getPSW())
          cycles = 12
          break

        // ORI d8
        case 0xF6:
          this.ora(this.fetchByte())
          cycles = 7
          break

        // RST 6
        case 0xF7:
          this.pushWord(this.state.PC)
          this.state.PC = 0x0030
          cycles = 12
          break

        // RM
        case 0xF8:
          if (this.state.flags.S) {
            this.state.PC = this.popWord()
            cycles = 12
          } else {
            cycles = 6
          }
          break

        // SPHL
        case 0xF9:
          this.state.SP = this.getHL()
          cycles = 6
          break

        // JM addr
        case 0xFA:
          {
            const addr = this.fetchWord()
            if (this.state.flags.S) {
              this.state.PC = addr
            }
          }
          cycles = 10
          break

        // EI
        case 0xFB:
          this.state.interruptEnabled = true
          cycles = 4
          break

        // CM addr
        case 0xFC:
          {
            const addr = this.fetchWord()
            if (this.state.flags.S) {
              this.pushWord(this.state.PC)
              this.state.PC = addr
              cycles = 18
            } else {
              cycles = 9
            }
          }
          break

        // CPI d8
        case 0xFE:
          this.cmp(this.fetchByte())
          cycles = 7
          break

        // RST 7
        case 0xFF:
          this.pushWord(this.state.PC)
          this.state.PC = 0x0038
          cycles = 12
          break

        default:
          return { success: false, error: `Opcode desconocido: 0x${opcode.toString(16).toUpperCase()}`, cyclesUsed: 0 }
      }

      return { success: true, cyclesUsed: cycles }
    } catch (err) {
      return { success: false, error: String(err), cyclesUsed: 0 }
    }
  }

  // Arithmetic helpers
  private add(value: number): void {
    const result = this.state.A + value
    const auxCarry = ((this.state.A & 0x0F) + (value & 0x0F)) > 0x0F
    this.state.flags.CY = result > 0xFF
    this.state.A = result & 0xFF
    this.updateFlags(this.state.A, auxCarry)
  }

  private adc(value: number): void {
    const carry = this.state.flags.CY ? 1 : 0
    const result = this.state.A + value + carry
    const auxCarry = ((this.state.A & 0x0F) + (value & 0x0F) + carry) > 0x0F
    this.state.flags.CY = result > 0xFF
    this.state.A = result & 0xFF
    this.updateFlags(this.state.A, auxCarry)
  }

  private sub(value: number): void {
    const result = this.state.A - value
    const auxCarry = (this.state.A & 0x0F) < (value & 0x0F)
    this.state.flags.CY = result < 0
    this.state.A = result & 0xFF
    this.updateFlags(this.state.A, auxCarry)
  }

  private sbb(value: number): void {
    const carry = this.state.flags.CY ? 1 : 0
    const result = this.state.A - value - carry
    const auxCarry = (this.state.A & 0x0F) < ((value & 0x0F) + carry)
    this.state.flags.CY = result < 0
    this.state.A = result & 0xFF
    this.updateFlags(this.state.A, auxCarry)
  }

  private ana(value: number): void {
    this.state.A = this.state.A & value
    this.state.flags.CY = false
    this.updateFlags(this.state.A, true)
  }

  private ora(value: number): void {
    this.state.A = this.state.A | value
    this.state.flags.CY = false
    this.updateFlags(this.state.A, false)
  }

  private xra(value: number): void {
    this.state.A = this.state.A ^ value
    this.state.flags.CY = false
    this.updateFlags(this.state.A, false)
  }

  private cmp(value: number): void {
    const result = this.state.A - value
    const auxCarry = (this.state.A & 0x0F) < (value & 0x0F)
    this.state.flags.CY = result < 0
    this.state.flags.Z = (result & 0xFF) === 0
    this.state.flags.S = ((result & 0xFF) & 0x80) !== 0
    this.state.flags.P = this.calculateParity(result & 0xFF)
    this.state.flags.AC = auxCarry
  }
}
