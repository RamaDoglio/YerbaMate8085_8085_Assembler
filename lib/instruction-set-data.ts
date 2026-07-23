export type FlagEffect = 'set' | 'reset' | 'affected' | 'unaffected' | 'modified'

export interface InstructionInfo {
  mnemonic: string
  opcode: string
  bytes: number
  cycles: number
  description: string
  flags: {
    Z: FlagEffect
    S: FlagEffect
    P: FlagEffect
    CY: FlagEffect
    AC: FlagEffect
  }
  addressing: string
  example?: string
}

export interface InstructionCategory {
  name: string
  description: string
  instructions: InstructionInfo[]
}

export const INSTRUCTION_CATEGORIES: InstructionCategory[] = [
  {
    name: 'Transferencia de Datos',
    description: 'Mueve datos entre registros, memoria y E/S. Ninguna bandera es afectada.',
    instructions: [
      { mnemonic: 'MOV r1, r2', opcode: '40-7F', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Copia el contenido del registro r2 en el registro r1. La fuente permanece sin cambios.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'MOV A, B  ; A = B' },
      { mnemonic: 'MOV r, M', opcode: '46,4E,56,5E,66,6E', bytes: 1, cycles: 7, addressing: 'Registro Indirecto', description: 'Copia el contenido de la dirección de memoria apuntada por HL en el registro r.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'MOV A, M  ; A = [HL]' },
      { mnemonic: 'MOV M, r', opcode: '70-75,77', bytes: 1, cycles: 7, addressing: 'Registro Indirecto', description: 'Copia el contenido del registro r en la dirección de memoria apuntada por HL.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'MOV M, A  ; [HL] = A' },
      { mnemonic: 'MVI r, d8', opcode: '06,0E,16,1E,26,2E,3E', bytes: 2, cycles: 7, addressing: 'Inmediato', description: 'Carga un valor inmediato de 8 bits en el registro r.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'MVI A, 25H' },
      { mnemonic: 'MVI M, d8', opcode: '36', bytes: 2, cycles: 10, addressing: 'Inmediato', description: 'Almacena un valor inmediato de 8 bits en la dirección de memoria apuntada por HL.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'MVI M, 00H' },
      { mnemonic: 'LXI rp, d16', opcode: '01,11,21,31', bytes: 3, cycles: 10, addressing: 'Inmediato 16 bits', description: 'Carga un valor inmediato de 16 bits en el par de registros (BC, DE, HL o SP). El primer byte va al registro bajo, el segundo al alto.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'LXI H, 2000H' },
      { mnemonic: 'LDA addr', opcode: '3A', bytes: 3, cycles: 13, addressing: 'Directo', description: 'Carga el acumulador con el contenido de memoria en la dirección de 16 bits dada.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'LDA 2050H' },
      { mnemonic: 'STA addr', opcode: '32', bytes: 3, cycles: 13, addressing: 'Directo', description: 'Almacena el contenido del acumulador en la memoria en la dirección de 16 bits dada.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'STA 2050H' },
      { mnemonic: 'LHLD addr', opcode: '2A', bytes: 3, cycles: 16, addressing: 'Directo', description: 'Carga el par HL directamente desde memoria. L obtiene el contenido de addr, H obtiene el de addr+1.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'LHLD 2000H' },
      { mnemonic: 'SHLD addr', opcode: '22', bytes: 3, cycles: 16, addressing: 'Directo', description: 'Almacena el par HL directamente en memoria. Mem[addr] recibe L, mem[addr+1] recibe H.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'SHLD 2000H' },
      { mnemonic: 'LDAX rp', opcode: '0A,1A', bytes: 1, cycles: 7, addressing: 'Registro Indirecto', description: 'Carga el acumulador con el contenido de la dirección apuntada por el par BC o DE.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'LDAX B  ; A = [BC]' },
      { mnemonic: 'STAX rp', opcode: '02,12', bytes: 1, cycles: 7, addressing: 'Registro Indirecto', description: 'Almacena el acumulador en la dirección apuntada por el par BC o DE.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'STAX D  ; [DE] = A' },
      { mnemonic: 'XCHG', opcode: 'EB', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Intercambia los contenidos de los pares HL y DE.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'XCHG  ; H<->D, L<->E' },
    ],
  },
  {
    name: 'Aritméticas',
    description: 'Realizan operaciones aritméticas. Afectan Z, S, P, CY y AC a menos que se indique lo contrario.',
    instructions: [
      { mnemonic: 'ADD r', opcode: '80-87', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Suma el registro r al acumulador. A = A + r.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'ADD B  ; A = A + B' },
      { mnemonic: 'ADD M', opcode: '86', bytes: 1, cycles: 7, addressing: 'Registro Indirecto', description: 'Suma el contenido de memoria apuntado por HL al acumulador. A = A + [HL].', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'ADD M' },
      { mnemonic: 'ADI d8', opcode: 'C6', bytes: 2, cycles: 7, addressing: 'Inmediato', description: 'Suma un valor inmediato de 8 bits al acumulador. A = A + byte2.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'ADI 25H' },
      { mnemonic: 'ADC r', opcode: '88-8F', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Suma el registro r más el acarreo al acumulador. A = A + r + CY.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'ADC B' },
      { mnemonic: 'ADC M', opcode: '8E', bytes: 1, cycles: 7, addressing: 'Registro Indirecto', description: 'Suma el contenido de [HL] más el acarreo al acumulador. A = A + [HL] + CY.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'ADC M' },
      { mnemonic: 'ACI d8', opcode: 'CE', bytes: 2, cycles: 7, addressing: 'Inmediato', description: 'Suma un valor inmediato más el acarreo al acumulador. A = A + byte2 + CY.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'ACI 30H' },
      { mnemonic: 'SUB r', opcode: '90-97', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Resta el registro r del acumulador. A = A - r (complemento a 2).', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'SUB B  ; A = A - B' },
      { mnemonic: 'SUB M', opcode: '96', bytes: 1, cycles: 7, addressing: 'Registro Indirecto', description: 'Resta el contenido de [HL] del acumulador. A = A - [HL].', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'SUB M' },
      { mnemonic: 'SUI d8', opcode: 'D6', bytes: 2, cycles: 7, addressing: 'Inmediato', description: 'Resta un valor inmediato del acumulador. A = A - byte2.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'SUI 10H' },
      { mnemonic: 'SBB r', opcode: '98-9F', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Resta el registro r y el préstamo (CY) del acumulador. A = A - r - CY.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'SBB B' },
      { mnemonic: 'SBB M', opcode: '9E', bytes: 1, cycles: 7, addressing: 'Registro Indirecto', description: 'Resta [HL] y el préstamo del acumulador. A = A - [HL] - CY.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'SBB M' },
      { mnemonic: 'SBI d8', opcode: 'DE', bytes: 2, cycles: 7, addressing: 'Inmediato', description: 'Resta un valor inmediato y el préstamo del acumulador. A = A - byte2 - CY.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'SBI 05H' },
      { mnemonic: 'INR r', opcode: '04,0C,14,1C,24,2C,3C', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Incrementa el registro r en 1. r = r + 1. La bandera CY NO se modifica.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'unaffected', AC: 'affected' }, example: 'INR B' },
      { mnemonic: 'INR M', opcode: '34', bytes: 1, cycles: 10, addressing: 'Registro Indirecto', description: 'Incrementa el contenido de [HL] en 1. [HL] = [HL] + 1. CY no se modifica.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'unaffected', AC: 'affected' }, example: 'INR M' },
      { mnemonic: 'DCR r', opcode: '05,0D,15,1D,25,2D,3D', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Decrementa el registro r en 1. r = r - 1. La bandera CY NO se modifica.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'unaffected', AC: 'affected' }, example: 'DCR C' },
      { mnemonic: 'DCR M', opcode: '35', bytes: 1, cycles: 10, addressing: 'Registro Indirecto', description: 'Decrementa el contenido de [HL] en 1. [HL] = [HL] - 1. CY no se modifica.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'unaffected', AC: 'affected' }, example: 'DCR M' },
      { mnemonic: 'INX rp', opcode: '03,13,23,33', bytes: 1, cycles: 6, addressing: 'Registro', description: 'Incrementa el par de registros en 1. rp = rp + 1. No afecta banderas.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'INX H' },
      { mnemonic: 'DCX rp', opcode: '0B,1B,2B,3B', bytes: 1, cycles: 6, addressing: 'Registro', description: 'Decrementa el par de registros en 1. rp = rp - 1. No afecta banderas.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'DCX B' },
      { mnemonic: 'DAD rp', opcode: '09,19,29,39', bytes: 1, cycles: 10, addressing: 'Registro', description: 'Suma el par de registros rp a HL. HL = HL + rp. Solo afecta CY (acarreo de doble precisión).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'modified', AC: 'unaffected' }, example: 'DAD B  ; HL = HL + BC' },
      { mnemonic: 'DAA', opcode: '27', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Ajuste decimal del acumulador. Ajusta A para suma BCD después de ADD/ADC. Si nibble bajo > 9 o AC=1, suma 6 al nibble bajo. Si nibble alto > 9 o CY=1, suma 6 al nibble alto.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'modified', AC: 'affected' }, example: 'DAA  ; ajustar para BCD' },
    ],
  },
  {
    name: 'Lógicas',
    description: 'Realizan operaciones lógicas AND, OR, XOR, comparación, rotación y complemento. CY y AC se resetean a 0 (excepto en comparación y rotación).',
    instructions: [
      { mnemonic: 'ANA r', opcode: 'A0-A7', bytes: 1, cycles: 4, addressing: 'Registro', description: 'AND del registro r con el acumulador. A = A & r. CY=0, AC=0.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'reset', AC: 'reset' }, example: 'ANA B' },
      { mnemonic: 'ANA M', opcode: 'A6', bytes: 1, cycles: 7, addressing: 'Registro Indirecto', description: 'AND de [HL] con el acumulador. A = A & [HL]. CY=0, AC=0.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'reset', AC: 'reset' }, example: 'ANA M' },
      { mnemonic: 'ANI d8', opcode: 'E6', bytes: 2, cycles: 7, addressing: 'Inmediato', description: 'AND inmediato con el acumulador. A = A & byte2. CY=0, AC=0.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'reset', AC: 'reset' }, example: 'ANI 0FH' },
      { mnemonic: 'ORA r', opcode: 'B0-B7', bytes: 1, cycles: 4, addressing: 'Registro', description: 'OR del registro r con el acumulador. A = A | r. CY=0, AC=0.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'reset', AC: 'reset' }, example: 'ORA B' },
      { mnemonic: 'ORA M', opcode: 'B6', bytes: 1, cycles: 7, addressing: 'Registro Indirecto', description: 'OR de [HL] con el acumulador. A = A | [HL]. CY=0, AC=0.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'reset', AC: 'reset' }, example: 'ORA M' },
      { mnemonic: 'ORI d8', opcode: 'F6', bytes: 2, cycles: 7, addressing: 'Inmediato', description: 'OR inmediato con el acumulador. A = A | byte2. CY=0, AC=0.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'reset', AC: 'reset' }, example: 'ORI 0F0H' },
      { mnemonic: 'XRA r', opcode: 'A8-AF', bytes: 1, cycles: 4, addressing: 'Registro', description: 'XOR del registro r con el acumulador. A = A ^ r. CY=0, AC=0.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'reset', AC: 'reset' }, example: 'XRA B  ; A = A XOR B' },
      { mnemonic: 'XRA M', opcode: 'AE', bytes: 1, cycles: 7, addressing: 'Registro Indirecto', description: 'XOR de [HL] con el acumulador. A = A ^ [HL]. CY=0, AC=0.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'reset', AC: 'reset' }, example: 'XRA M' },
      { mnemonic: 'XRI d8', opcode: 'EE', bytes: 2, cycles: 7, addressing: 'Inmediato', description: 'XOR inmediato con el acumulador. A = A ^ byte2. CY=0, AC=0.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'reset', AC: 'reset' }, example: 'XRI 0FFH' },
      { mnemonic: 'CMP r', opcode: 'B8-BF', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Compara el registro r con el acumulador. A - r (sin modificar). Z=1 si A=r, CY=1 si A<r.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'CMP B  ; comparar A con B' },
      { mnemonic: 'CMP M', opcode: 'BE', bytes: 1, cycles: 7, addressing: 'Registro Indirecto', description: 'Compara [HL] con el acumulador. A - [HL]. Z=1 si iguales, CY=1 si A<[HL].', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'CMP M' },
      { mnemonic: 'CPI d8', opcode: 'FE', bytes: 2, cycles: 7, addressing: 'Inmediato', description: 'Compara un valor inmediato con el acumulador. A - byte2. Z=1 si igual, CY=1 si A<valor.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'CPI 00H' },
      { mnemonic: 'RLC', opcode: '07', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Rota el acumulador a la izquierda. El bit 7 va a CY y también al bit 0.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'modified', AC: 'unaffected' }, example: 'RLC' },
      { mnemonic: 'RRC', opcode: '0F', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Rota el acumulador a la derecha. El bit 0 va a CY y también al bit 7.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'modified', AC: 'unaffected' }, example: 'RRC' },
      { mnemonic: 'RAL', opcode: '17', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Rota el acumulador a la izquierda a través del acarreo. Bit 7 va a CY, CY va a bit 0.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'modified', AC: 'unaffected' }, example: 'RAL' },
      { mnemonic: 'RAR', opcode: '1F', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Rota el acumulador a la derecha a través del acarreo. Bit 0 va a CY, CY va a bit 7.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'modified', AC: 'unaffected' }, example: 'RAR' },
      { mnemonic: 'CMA', opcode: '2F', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Complementa el acumulador. A = ~A (complemento a 1). No afecta banderas.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CMA' },
      { mnemonic: 'CMC', opcode: '3F', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Complementa la bandera de acarreo. CY = ~CY.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'modified', AC: 'unaffected' }, example: 'CMC' },
      { mnemonic: 'STC', opcode: '37', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Pone la bandera de acarreo a 1. CY = 1.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'set', AC: 'unaffected' }, example: 'STC' },
    ],
  },
  {
    name: 'Saltos',
    description: 'Alteran el flujo normal del programa. Ninguna bandera se altera con estas instrucciones.',
    instructions: [
      { mnemonic: 'JMP addr', opcode: 'C3', bytes: 3, cycles: 10, addressing: 'Directo', description: 'Salto incondicional. PC = addr (byte3:byte2). El programa continúa desde la dirección dada.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'JMP 2000H' },
      { mnemonic: 'JZ addr', opcode: 'CA', bytes: 3, cycles: 10, addressing: 'Directo', description: 'Salto si cero (Z=1). Salta si la bandera Z está activa.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'JZ LOOP' },
      { mnemonic: 'JNZ addr', opcode: 'C2', bytes: 3, cycles: 10, addressing: 'Directo', description: 'Salto si no es cero (Z=0). Salta si la bandera Z está inactiva.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'JNZ LOOP' },
      { mnemonic: 'JC addr', opcode: 'DA', bytes: 3, cycles: 10, addressing: 'Directo', description: 'Salto si hay acarreo (CY=1).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'JC ERROR' },
      { mnemonic: 'JNC addr', opcode: 'D2', bytes: 3, cycles: 10, addressing: 'Directo', description: 'Salto si no hay acarreo (CY=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'JNC DONE' },
      { mnemonic: 'JP addr', opcode: 'F2', bytes: 3, cycles: 10, addressing: 'Directo', description: 'Salto si positivo (S=0). Salta si la bandera de signo es 0.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'JP POS' },
      { mnemonic: 'JM addr', opcode: 'FA', bytes: 3, cycles: 10, addressing: 'Directo', description: 'Salto si negativo (S=1). Salta si la bandera de signo es 1.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'JM NEG' },
      { mnemonic: 'JPE addr', opcode: 'EA', bytes: 3, cycles: 10, addressing: 'Directo', description: 'Salto si paridad par (P=1).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'JPE EVEN' },
      { mnemonic: 'JPO addr', opcode: 'E2', bytes: 3, cycles: 10, addressing: 'Directo', description: 'Salto si paridad impar (P=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'JPO ODD' },
      { mnemonic: 'PCHL', opcode: 'E9', bytes: 1, cycles: 6, addressing: 'Registro Indirecto', description: 'Salta a la dirección contenida en HL. PC = HL. Usado para saltos calculados.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'PCHL  ; PC = HL' },
      { mnemonic: 'CALL addr', opcode: 'CD', bytes: 3, cycles: 18, addressing: 'Directo', description: 'Llamada incondicional a subrutina. Apila PC en la pila y salta a la dirección.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CALL SUBR' },
      { mnemonic: 'CZ addr', opcode: 'CC', bytes: 3, cycles: 18/9, addressing: 'Directo', description: 'Llamada si cero (Z=1). 18 ciclos si se ejecuta, 9 si no.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CZ SUBR' },
      { mnemonic: 'CNZ addr', opcode: 'C4', bytes: 3, cycles: 18/9, addressing: 'Directo', description: 'Llamada si no es cero (Z=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CNZ SUBR' },
      { mnemonic: 'CC addr', opcode: 'DC', bytes: 3, cycles: 18/9, addressing: 'Directo', description: 'Llamada si hay acarreo (CY=1).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CC SUBR' },
      { mnemonic: 'CNC addr', opcode: 'D4', bytes: 3, cycles: 18/9, addressing: 'Directo', description: 'Llamada si no hay acarreo (CY=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CNC SUBR' },
      { mnemonic: 'CP addr', opcode: 'F4', bytes: 3, cycles: 18/9, addressing: 'Directo', description: 'Llamada si positivo (S=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CP SUBR' },
      { mnemonic: 'CM addr', opcode: 'FC', bytes: 3, cycles: 18/9, addressing: 'Directo', description: 'Llamada si negativo (S=1).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CM SUBR' },
      { mnemonic: 'CPE addr', opcode: 'EC', bytes: 3, cycles: 18/9, addressing: 'Directo', description: 'Llamada si paridad par (P=1).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CPE SUBR' },
      { mnemonic: 'CPO addr', opcode: 'E4', bytes: 3, cycles: 18/9, addressing: 'Directo', description: 'Llamada si paridad impar (P=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CPO SUBR' },
      { mnemonic: 'RET', opcode: 'C9', bytes: 1, cycles: 10, addressing: 'Registro', description: 'Retorno incondicional de subrutina. Recupera la dirección de la pila y la carga en PC.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RET' },
      { mnemonic: 'RZ', opcode: 'C8', bytes: 1, cycles: 12/6, addressing: 'Registro', description: 'Retorno si cero (Z=1). 12 ciclos si retorna, 6 si no.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RZ' },
      { mnemonic: 'RNZ', opcode: 'C0', bytes: 1, cycles: 12/6, addressing: 'Registro', description: 'Retorno si no es cero (Z=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RNZ' },
      { mnemonic: 'RC', opcode: 'D8', bytes: 1, cycles: 12/6, addressing: 'Registro', description: 'Retorno si hay acarreo (CY=1).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RC' },
      { mnemonic: 'RNC', opcode: 'D0', bytes: 1, cycles: 12/6, addressing: 'Registro', description: 'Retorno si no hay acarreo (CY=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RNC' },
      { mnemonic: 'RP', opcode: 'F0', bytes: 1, cycles: 12/6, addressing: 'Registro', description: 'Retorno si positivo (S=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RP' },
      { mnemonic: 'RM', opcode: 'F8', bytes: 1, cycles: 12/6, addressing: 'Registro', description: 'Retorno si negativo (S=1).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RM' },
      { mnemonic: 'RPE', opcode: 'E8', bytes: 1, cycles: 12/6, addressing: 'Registro', description: 'Retorno si paridad par (P=1).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RPE' },
      { mnemonic: 'RPO', opcode: 'E0', bytes: 1, cycles: 12/6, addressing: 'Registro', description: 'Retorno si paridad impar (P=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RPO' },
      { mnemonic: 'RST n', opcode: 'C7,CF,D7,DF,E7,EF,F7,FF', bytes: 1, cycles: 12, addressing: 'Registro', description: 'Reinicio. Instrucción de 1 byte que llama a la dirección 8*n (n=0..7). Usada para interrupciones.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RST 0  ; llamar a 0000h' },
    ],
  },
  {
    name: 'Pila, E/S y Control',
    description: 'Operaciones de pila, E/S, control de interrupciones y control del procesador.',
    instructions: [
      { mnemonic: 'PUSH rp', opcode: 'C5,D5,E5', bytes: 1, cycles: 12, addressing: 'Registro', description: 'Apila el par de registros (BC, DE, HL) en la pila. SP se decrementa en 2. No se puede usar PUSH SP.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'PUSH B' },
      { mnemonic: 'PUSH PSW', opcode: 'F5', bytes: 1, cycles: 12, addressing: 'Registro', description: 'Apila el acumulador y las banderas (PSW) en la pila. SP se decrementa en 2.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'PUSH PSW' },
      { mnemonic: 'POP rp', opcode: 'C1,D1,E1', bytes: 1, cycles: 10, addressing: 'Registro', description: 'Desapila el par de registros (BC, DE, HL) de la pila. SP se incrementa en 2.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'POP B' },
      { mnemonic: 'POP PSW', opcode: 'F1', bytes: 1, cycles: 10, addressing: 'Registro', description: 'Desapila el acumulador y las banderas (PSW) de la pila. SP se incrementa en 2. Afecta todas las banderas.', flags: { Z: 'modified', S: 'modified', P: 'modified', CY: 'modified', AC: 'modified' }, example: 'POP PSW' },
      { mnemonic: 'XTHL', opcode: 'E3', bytes: 1, cycles: 16, addressing: 'Registro', description: 'Intercambia HL con el tope de la pila. L <-> [SP], H <-> [SP+1].', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'XTHL' },
      { mnemonic: 'SPHL', opcode: 'F9', bytes: 1, cycles: 6, addressing: 'Registro', description: 'Mueve HL a SP. SP = HL.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'SPHL' },
      { mnemonic: 'IN puerto', opcode: 'DB', bytes: 2, cycles: 10, addressing: 'Inmediato', description: 'Lee de un puerto de entrada. A = dato del puerto (dirección de 8 bits).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'IN 20H' },
      { mnemonic: 'OUT puerto', opcode: 'D3', bytes: 2, cycles: 10, addressing: 'Inmediato', description: 'Escribe a un puerto de salida. El puerto recibe el valor de A.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'OUT 20H' },
      { mnemonic: 'EI', opcode: 'FB', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Habilita las interrupciones. Activa el sistema de interrupciones (excepto TRAP que siempre está activo).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'EI' },
      { mnemonic: 'DI', opcode: 'F3', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Deshabilita las interrupciones. Desactiva el sistema de interrupciones (excepto TRAP).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'DI' },
      { mnemonic: 'HLT', opcode: '76', bytes: 1, cycles: 5, addressing: 'Registro', description: 'Detiene el procesador. La CPU deja de ejecutar. PC apunta a la siguiente instrucción. Solo un reset o interrupción puede reiniciarlo.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'HLT' },
      { mnemonic: 'NOP', opcode: '00', bytes: 1, cycles: 4, addressing: 'Registro', description: 'No operación. No hace nada, solo consume 4 T-estados.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'NOP' },
      { mnemonic: 'RIM', opcode: '20', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Lee la máscara de interrupción. Carga en A: bits 0-2 = máscaras (RST 5.5-7.5), bit 3 = IE, bits 4-6 = interrupciones pendientes, bit 7 = SID.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RIM' },
      { mnemonic: 'SIM', opcode: '30', bytes: 1, cycles: 4, addressing: 'Registro', description: 'Programa las máscaras de interrupción. Configura máscaras para RST 5.5-7.5 (bits 0-2, habilitados por bit 3=MSE). Bit 4 resetea RST 7.5. Bits 6-7 controlan la salida SOD.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'SIM' },
    ],
  },
]

export function findInstruction(mnemonic: string): InstructionInfo | null {
  const upper = mnemonic.toUpperCase()
  for (const cat of INSTRUCTION_CATEGORIES) {
    for (const inst of cat.instructions) {
      if (inst.mnemonic.toUpperCase() === upper || inst.mnemonic.toUpperCase().startsWith(upper)) {
        return inst
      }
    }
  }
  return null
}

const INSTRUCTION_CATEGORIES_EN: InstructionCategory[] = [
  {
    name: 'Data Transfer',
    description: 'Moves data between registers, memory and I/O. No flags are affected.',
    instructions: [
      { mnemonic: 'MOV r1, r2', opcode: '40-7F', bytes: 1, cycles: 4, addressing: 'Register', description: 'Copies the content of register r2 into register r1. The source remains unchanged.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'MOV A, B  ; A = B' },
      { mnemonic: 'MOV r, M', opcode: '46,4E,56,5E,66,6E', bytes: 1, cycles: 7, addressing: 'Register Indirect', description: 'Copies the content of the memory address pointed by HL into register r.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'MOV A, M  ; A = [HL]' },
      { mnemonic: 'MOV M, r', opcode: '70-75,77', bytes: 1, cycles: 7, addressing: 'Register Indirect', description: 'Copies the content of register r into the memory address pointed by HL.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'MOV M, A  ; [HL] = A' },
      { mnemonic: 'MVI r, d8', opcode: '06,0E,16,1E,26,2E,3E', bytes: 2, cycles: 7, addressing: 'Immediate', description: 'Loads an 8-bit immediate value into register r.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'MVI A, 25H' },
      { mnemonic: 'MVI M, d8', opcode: '36', bytes: 2, cycles: 10, addressing: 'Immediate', description: 'Stores an 8-bit immediate value at the memory address pointed by HL.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'MVI M, 00H' },
      { mnemonic: 'LXI rp, d16', opcode: '01,11,21,31', bytes: 3, cycles: 10, addressing: '16-bit Immediate', description: 'Loads a 16-bit immediate value into a register pair (BC, DE, HL or SP). First byte goes to the low register, second to the high.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'LXI H, 2000H' },
      { mnemonic: 'LDA addr', opcode: '3A', bytes: 3, cycles: 13, addressing: 'Direct', description: 'Loads the accumulator with the memory content at the given 16-bit address.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'LDA 2050H' },
      { mnemonic: 'STA addr', opcode: '32', bytes: 3, cycles: 13, addressing: 'Direct', description: 'Stores the accumulator content into memory at the given 16-bit address.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'STA 2050H' },
      { mnemonic: 'LHLD addr', opcode: '2A', bytes: 3, cycles: 16, addressing: 'Direct', description: 'Loads the HL pair directly from memory. L gets the content of addr, H gets the content of addr+1.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'LHLD 2000H' },
      { mnemonic: 'SHLD addr', opcode: '22', bytes: 3, cycles: 16, addressing: 'Direct', description: 'Stores the HL pair directly to memory. Mem[addr] receives L, mem[addr+1] receives H.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'SHLD 2000H' },
      { mnemonic: 'LDAX rp', opcode: '0A,1A', bytes: 1, cycles: 7, addressing: 'Register Indirect', description: 'Loads the accumulator with the content of the address pointed by register pair BC or DE.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'LDAX B  ; A = [BC]' },
      { mnemonic: 'STAX rp', opcode: '02,12', bytes: 1, cycles: 7, addressing: 'Register Indirect', description: 'Stores the accumulator at the address pointed by register pair BC or DE.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'STAX D  ; [DE] = A' },
      { mnemonic: 'XCHG', opcode: 'EB', bytes: 1, cycles: 4, addressing: 'Register', description: 'Exchanges the contents of the HL and DE register pairs.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'XCHG  ; H<->D, L<->E' },
    ],
  },
  {
    name: 'Arithmetic',
    description: 'Perform arithmetic operations. Affect Z, S, P, CY and AC unless otherwise noted.',
    instructions: [
      { mnemonic: 'ADD r', opcode: '80-87', bytes: 1, cycles: 4, addressing: 'Register', description: 'Adds register r to the accumulator. A = A + r.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'ADD B  ; A = A + B' },
      { mnemonic: 'ADD M', opcode: '86', bytes: 1, cycles: 7, addressing: 'Register Indirect', description: 'Adds the memory content pointed by HL to the accumulator. A = A + [HL].', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'ADD M' },
      { mnemonic: 'ADI d8', opcode: 'C6', bytes: 2, cycles: 7, addressing: 'Immediate', description: 'Adds an 8-bit immediate value to the accumulator. A = A + byte2.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'ADI 25H' },
      { mnemonic: 'ADC r', opcode: '88-8F', bytes: 1, cycles: 4, addressing: 'Register', description: 'Adds register r plus the carry to the accumulator. A = A + r + CY.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'ADC B' },
      { mnemonic: 'ADC M', opcode: '8E', bytes: 1, cycles: 7, addressing: 'Register Indirect', description: 'Adds the content of [HL] plus the carry to the accumulator. A = A + [HL] + CY.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'ADC M' },
      { mnemonic: 'ACI d8', opcode: 'CE', bytes: 2, cycles: 7, addressing: 'Immediate', description: 'Adds an immediate value plus the carry to the accumulator. A = A + byte2 + CY.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'ACI 30H' },
      { mnemonic: 'SUB r', opcode: '90-97', bytes: 1, cycles: 4, addressing: 'Register', description: 'Subtracts register r from the accumulator. A = A - r (2\'s complement).', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'SUB B  ; A = A - B' },
      { mnemonic: 'SUB M', opcode: '96', bytes: 1, cycles: 7, addressing: 'Register Indirect', description: 'Subtracts the content of [HL] from the accumulator. A = A - [HL].', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'SUB M' },
      { mnemonic: 'SUI d8', opcode: 'D6', bytes: 2, cycles: 7, addressing: 'Immediate', description: 'Subtracts an immediate value from the accumulator. A = A - byte2.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'SUI 10H' },
      { mnemonic: 'SBB r', opcode: '98-9F', bytes: 1, cycles: 4, addressing: 'Register', description: 'Subtracts register r and the borrow (CY) from the accumulator. A = A - r - CY.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'SBB B' },
      { mnemonic: 'SBB M', opcode: '9E', bytes: 1, cycles: 7, addressing: 'Register Indirect', description: 'Subtracts [HL] and the borrow from the accumulator. A = A - [HL] - CY.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'SBB M' },
      { mnemonic: 'SBI d8', opcode: 'DE', bytes: 2, cycles: 7, addressing: 'Immediate', description: 'Subtracts an immediate value and the borrow from the accumulator. A = A - byte2 - CY.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'SBI 05H' },
      { mnemonic: 'INR r', opcode: '04,0C,14,1C,24,2C,3C', bytes: 1, cycles: 4, addressing: 'Register', description: 'Increments register r by 1. r = r + 1. The CY flag is NOT modified.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'unaffected', AC: 'affected' }, example: 'INR B' },
      { mnemonic: 'INR M', opcode: '34', bytes: 1, cycles: 10, addressing: 'Register Indirect', description: 'Increments the content of [HL] by 1. [HL] = [HL] + 1. CY is not modified.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'unaffected', AC: 'affected' }, example: 'INR M' },
      { mnemonic: 'DCR r', opcode: '05,0D,15,1D,25,2D,3D', bytes: 1, cycles: 4, addressing: 'Register', description: 'Decrements register r by 1. r = r - 1. The CY flag is NOT modified.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'unaffected', AC: 'affected' }, example: 'DCR C' },
      { mnemonic: 'DCR M', opcode: '35', bytes: 1, cycles: 10, addressing: 'Register Indirect', description: 'Decrements the content of [HL] by 1. [HL] = [HL] - 1. CY is not modified.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'unaffected', AC: 'affected' }, example: 'DCR M' },
      { mnemonic: 'INX rp', opcode: '03,13,23,33', bytes: 1, cycles: 6, addressing: 'Register', description: 'Increments the register pair by 1. rp = rp + 1. Does not affect flags.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'INX H' },
      { mnemonic: 'DCX rp', opcode: '0B,1B,2B,3B', bytes: 1, cycles: 6, addressing: 'Register', description: 'Decrements the register pair by 1. rp = rp - 1. Does not affect flags.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'DCX B' },
      { mnemonic: 'DAD rp', opcode: '09,19,29,39', bytes: 1, cycles: 10, addressing: 'Register', description: 'Adds register pair rp to HL. HL = HL + rp. Only affects CY (double-precision carry).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'modified', AC: 'unaffected' }, example: 'DAD B  ; HL = HL + BC' },
      { mnemonic: 'DAA', opcode: '27', bytes: 1, cycles: 4, addressing: 'Register', description: 'Decimal adjust accumulator. Adjusts A for BCD addition after ADD/ADC. If low nibble > 9 or AC=1, adds 6 to low nibble. If high nibble > 9 or CY=1, adds 6 to high nibble.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'modified', AC: 'affected' }, example: 'DAA  ; adjust for BCD' },
    ],
  },
  {
    name: 'Logical',
    description: 'Perform logical AND, OR, XOR, compare, rotate and complement operations. CY and AC are reset to 0 (except in compare and rotate).',
    instructions: [
      { mnemonic: 'ANA r', opcode: 'A0-A7', bytes: 1, cycles: 4, addressing: 'Register', description: 'AND register r with accumulator. A = A & r. CY=0, AC=0.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'reset', AC: 'reset' }, example: 'ANA B' },
      { mnemonic: 'ANA M', opcode: 'A6', bytes: 1, cycles: 7, addressing: 'Register Indirect', description: 'AND [HL] with accumulator. A = A & [HL]. CY=0, AC=0.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'reset', AC: 'reset' }, example: 'ANA M' },
      { mnemonic: 'ANI d8', opcode: 'E6', bytes: 2, cycles: 7, addressing: 'Immediate', description: 'AND immediate with accumulator. A = A & byte2. CY=0, AC=0.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'reset', AC: 'reset' }, example: 'ANI 0FH' },
      { mnemonic: 'ORA r', opcode: 'B0-B7', bytes: 1, cycles: 4, addressing: 'Register', description: 'OR register r with accumulator. A = A | r. CY=0, AC=0.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'reset', AC: 'reset' }, example: 'ORA B' },
      { mnemonic: 'ORA M', opcode: 'B6', bytes: 1, cycles: 7, addressing: 'Register Indirect', description: 'OR [HL] with accumulator. A = A | [HL]. CY=0, AC=0.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'reset', AC: 'reset' }, example: 'ORA M' },
      { mnemonic: 'ORI d8', opcode: 'F6', bytes: 2, cycles: 7, addressing: 'Immediate', description: 'OR immediate with accumulator. A = A | byte2. CY=0, AC=0.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'reset', AC: 'reset' }, example: 'ORI 0F0H' },
      { mnemonic: 'XRA r', opcode: 'A8-AF', bytes: 1, cycles: 4, addressing: 'Register', description: 'XOR register r with accumulator. A = A ^ r. CY=0, AC=0.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'reset', AC: 'reset' }, example: 'XRA B  ; A = A XOR B' },
      { mnemonic: 'XRA M', opcode: 'AE', bytes: 1, cycles: 7, addressing: 'Register Indirect', description: 'XOR [HL] with accumulator. A = A ^ [HL]. CY=0, AC=0.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'reset', AC: 'reset' }, example: 'XRA M' },
      { mnemonic: 'XRI d8', opcode: 'EE', bytes: 2, cycles: 7, addressing: 'Immediate', description: 'XOR immediate with accumulator. A = A ^ byte2. CY=0, AC=0.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'reset', AC: 'reset' }, example: 'XRI 0FFH' },
      { mnemonic: 'CMP r', opcode: 'B8-BF', bytes: 1, cycles: 4, addressing: 'Register', description: 'Compares register r with accumulator. A - r (no modification). Z=1 if A=r, CY=1 if A<r.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'CMP B  ; compare A with B' },
      { mnemonic: 'CMP M', opcode: 'BE', bytes: 1, cycles: 7, addressing: 'Register Indirect', description: 'Compares [HL] with accumulator. A - [HL]. Z=1 if equal, CY=1 if A<[HL].', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'CMP M' },
      { mnemonic: 'CPI d8', opcode: 'FE', bytes: 2, cycles: 7, addressing: 'Immediate', description: 'Compares an immediate value with accumulator. A - byte2. Z=1 if equal, CY=1 if A<value.', flags: { Z: 'affected', S: 'affected', P: 'affected', CY: 'affected', AC: 'affected' }, example: 'CPI 00H' },
      { mnemonic: 'RLC', opcode: '07', bytes: 1, cycles: 4, addressing: 'Register', description: 'Rotates accumulator left. Bit 7 goes to CY and also to bit 0.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'modified', AC: 'unaffected' }, example: 'RLC' },
      { mnemonic: 'RRC', opcode: '0F', bytes: 1, cycles: 4, addressing: 'Register', description: 'Rotates accumulator right. Bit 0 goes to CY and also to bit 7.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'modified', AC: 'unaffected' }, example: 'RRC' },
      { mnemonic: 'RAL', opcode: '17', bytes: 1, cycles: 4, addressing: 'Register', description: 'Rotates accumulator left through carry. Bit 7 goes to CY, CY goes to bit 0.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'modified', AC: 'unaffected' }, example: 'RAL' },
      { mnemonic: 'RAR', opcode: '1F', bytes: 1, cycles: 4, addressing: 'Register', description: 'Rotates accumulator right through carry. Bit 0 goes to CY, CY goes to bit 7.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'modified', AC: 'unaffected' }, example: 'RAR' },
      { mnemonic: 'CMA', opcode: '2F', bytes: 1, cycles: 4, addressing: 'Register', description: 'Complements the accumulator. A = ~A (1\'s complement). Does not affect flags.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CMA' },
      { mnemonic: 'CMC', opcode: '3F', bytes: 1, cycles: 4, addressing: 'Register', description: 'Complements the carry flag. CY = ~CY.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'modified', AC: 'unaffected' }, example: 'CMC' },
      { mnemonic: 'STC', opcode: '37', bytes: 1, cycles: 4, addressing: 'Register', description: 'Sets the carry flag to 1. CY = 1.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'set', AC: 'unaffected' }, example: 'STC' },
    ],
  },
  {
    name: 'Branch',
    description: 'Alter the normal program flow. No flags are affected by these instructions.',
    instructions: [
      { mnemonic: 'JMP addr', opcode: 'C3', bytes: 3, cycles: 10, addressing: 'Direct', description: 'Unconditional jump. PC = addr (byte3:byte2). Program continues from the given address.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'JMP 2000H' },
      { mnemonic: 'JZ addr', opcode: 'CA', bytes: 3, cycles: 10, addressing: 'Direct', description: 'Jump if zero (Z=1). Jumps if the Z flag is set.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'JZ LOOP' },
      { mnemonic: 'JNZ addr', opcode: 'C2', bytes: 3, cycles: 10, addressing: 'Direct', description: 'Jump if not zero (Z=0). Jumps if the Z flag is reset.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'JNZ LOOP' },
      { mnemonic: 'JC addr', opcode: 'DA', bytes: 3, cycles: 10, addressing: 'Direct', description: 'Jump if carry (CY=1).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'JC ERROR' },
      { mnemonic: 'JNC addr', opcode: 'D2', bytes: 3, cycles: 10, addressing: 'Direct', description: 'Jump if no carry (CY=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'JNC DONE' },
      { mnemonic: 'JP addr', opcode: 'F2', bytes: 3, cycles: 10, addressing: 'Direct', description: 'Jump if positive (S=0). Jumps if the sign flag is 0.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'JP POS' },
      { mnemonic: 'JM addr', opcode: 'FA', bytes: 3, cycles: 10, addressing: 'Direct', description: 'Jump if negative (S=1). Jumps if the sign flag is 1.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'JM NEG' },
      { mnemonic: 'JPE addr', opcode: 'EA', bytes: 3, cycles: 10, addressing: 'Direct', description: 'Jump if parity even (P=1).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'JPE EVEN' },
      { mnemonic: 'JPO addr', opcode: 'E2', bytes: 3, cycles: 10, addressing: 'Direct', description: 'Jump if parity odd (P=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'JPO ODD' },
      { mnemonic: 'PCHL', opcode: 'E9', bytes: 1, cycles: 6, addressing: 'Register Indirect', description: 'Jumps to the address contained in HL. PC = HL. Used for computed jumps.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'PCHL  ; PC = HL' },
      { mnemonic: 'CALL addr', opcode: 'CD', bytes: 3, cycles: 18, addressing: 'Direct', description: 'Unconditional subroutine call. Pushes PC onto the stack and jumps to the address.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CALL SUBR' },
      { mnemonic: 'CZ addr', opcode: 'CC', bytes: 3, cycles: 18/9, addressing: 'Direct', description: 'Call if zero (Z=1). 18 cycles if taken, 9 if not.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CZ SUBR' },
      { mnemonic: 'CNZ addr', opcode: 'C4', bytes: 3, cycles: 18/9, addressing: 'Direct', description: 'Call if not zero (Z=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CNZ SUBR' },
      { mnemonic: 'CC addr', opcode: 'DC', bytes: 3, cycles: 18/9, addressing: 'Direct', description: 'Call if carry (CY=1).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CC SUBR' },
      { mnemonic: 'CNC addr', opcode: 'D4', bytes: 3, cycles: 18/9, addressing: 'Direct', description: 'Call if no carry (CY=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CNC SUBR' },
      { mnemonic: 'CP addr', opcode: 'F4', bytes: 3, cycles: 18/9, addressing: 'Direct', description: 'Call if positive (S=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CP SUBR' },
      { mnemonic: 'CM addr', opcode: 'FC', bytes: 3, cycles: 18/9, addressing: 'Direct', description: 'Call if negative (S=1).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CM SUBR' },
      { mnemonic: 'CPE addr', opcode: 'EC', bytes: 3, cycles: 18/9, addressing: 'Direct', description: 'Call if parity even (P=1).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CPE SUBR' },
      { mnemonic: 'CPO addr', opcode: 'E4', bytes: 3, cycles: 18/9, addressing: 'Direct', description: 'Call if parity odd (P=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'CPO SUBR' },
      { mnemonic: 'RET', opcode: 'C9', bytes: 1, cycles: 10, addressing: 'Register', description: 'Unconditional subroutine return. Pops the address from the stack and loads it into PC.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RET' },
      { mnemonic: 'RZ', opcode: 'C8', bytes: 1, cycles: 12/6, addressing: 'Register', description: 'Return if zero (Z=1). 12 cycles if return, 6 if not.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RZ' },
      { mnemonic: 'RNZ', opcode: 'C0', bytes: 1, cycles: 12/6, addressing: 'Register', description: 'Return if not zero (Z=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RNZ' },
      { mnemonic: 'RC', opcode: 'D8', bytes: 1, cycles: 12/6, addressing: 'Register', description: 'Return if carry (CY=1).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RC' },
      { mnemonic: 'RNC', opcode: 'D0', bytes: 1, cycles: 12/6, addressing: 'Register', description: 'Return if no carry (CY=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RNC' },
      { mnemonic: 'RP', opcode: 'F0', bytes: 1, cycles: 12/6, addressing: 'Register', description: 'Return if positive (S=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RP' },
      { mnemonic: 'RM', opcode: 'F8', bytes: 1, cycles: 12/6, addressing: 'Register', description: 'Return if negative (S=1).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RM' },
      { mnemonic: 'RPE', opcode: 'E8', bytes: 1, cycles: 12/6, addressing: 'Register', description: 'Return if parity even (P=1).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RPE' },
      { mnemonic: 'RPO', opcode: 'E0', bytes: 1, cycles: 12/6, addressing: 'Register', description: 'Return if parity odd (P=0).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RPO' },
      { mnemonic: 'RST n', opcode: 'C7,CF,D7,DF,E7,EF,F7,FF', bytes: 1, cycles: 12, addressing: 'Register', description: 'Restart. 1-byte instruction that calls address 8*n (n=0..7). Used for interrupts.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RST 0  ; call 0000h' },
    ],
  },
  {
    name: 'Stack, I/O and Control',
    description: 'Stack operations, I/O, interrupt control and processor control.',
    instructions: [
      { mnemonic: 'PUSH rp', opcode: 'C5,D5,E5', bytes: 1, cycles: 12, addressing: 'Register', description: 'Pushes register pair (BC, DE, HL) onto the stack. SP is decremented by 2. PUSH SP cannot be used.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'PUSH B' },
      { mnemonic: 'PUSH PSW', opcode: 'F5', bytes: 1, cycles: 12, addressing: 'Register', description: 'Pushes the accumulator and flags (PSW) onto the stack. SP is decremented by 2.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'PUSH PSW' },
      { mnemonic: 'POP rp', opcode: 'C1,D1,E1', bytes: 1, cycles: 10, addressing: 'Register', description: 'Pops register pair (BC, DE, HL) from the stack. SP is incremented by 2.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'POP B' },
      { mnemonic: 'POP PSW', opcode: 'F1', bytes: 1, cycles: 10, addressing: 'Register', description: 'Pops the accumulator and flags (PSW) from the stack. SP is incremented by 2. Affects all flags.', flags: { Z: 'modified', S: 'modified', P: 'modified', CY: 'modified', AC: 'modified' }, example: 'POP PSW' },
      { mnemonic: 'XTHL', opcode: 'E3', bytes: 1, cycles: 16, addressing: 'Register', description: 'Exchanges HL with the top of the stack. L <-> [SP], H <-> [SP+1].', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'XTHL' },
      { mnemonic: 'SPHL', opcode: 'F9', bytes: 1, cycles: 6, addressing: 'Register', description: 'Moves HL to SP. SP = HL.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'SPHL' },
      { mnemonic: 'IN port', opcode: 'DB', bytes: 2, cycles: 10, addressing: 'Immediate', description: 'Reads from an input port. A = data from the port (8-bit address).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'IN 20H' },
      { mnemonic: 'OUT port', opcode: 'D3', bytes: 2, cycles: 10, addressing: 'Immediate', description: 'Writes to an output port. The port receives the value of A.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'OUT 20H' },
      { mnemonic: 'EI', opcode: 'FB', bytes: 1, cycles: 4, addressing: 'Register', description: 'Enables interrupts. Activates the interrupt system (except TRAP which is always active).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'EI' },
      { mnemonic: 'DI', opcode: 'F3', bytes: 1, cycles: 4, addressing: 'Register', description: 'Disables interrupts. Deactivates the interrupt system (except TRAP).', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'DI' },
      { mnemonic: 'HLT', opcode: '76', bytes: 1, cycles: 5, addressing: 'Register', description: 'Halts the processor. CPU stops executing. PC points to the next instruction. Only a reset or interrupt can restart it.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'HLT' },
      { mnemonic: 'NOP', opcode: '00', bytes: 1, cycles: 4, addressing: 'Register', description: 'No operation. Does nothing, only consumes 4 T-states.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'NOP' },
      { mnemonic: 'RIM', opcode: '20', bytes: 1, cycles: 4, addressing: 'Register', description: 'Reads interrupt mask. Loads into A: bits 0-2 = masks (RST 5.5-7.5), bit 3 = IE, bits 4-6 = pending interrupts, bit 7 = SID.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'RIM' },
      { mnemonic: 'SIM', opcode: '30', bytes: 1, cycles: 4, addressing: 'Register', description: 'Sets interrupt masks. Configures masks for RST 5.5-7.5 (bits 0-2, enabled by bit 3=MSE). Bit 4 resets RST 7.5. Bits 6-7 control SOD output.', flags: { Z: 'unaffected', S: 'unaffected', P: 'unaffected', CY: 'unaffected', AC: 'unaffected' }, example: 'SIM' },
    ],
  },
]

const ADDRESSING_MAP_EN: Record<string, string> = {
  'Registro': 'Register',
  'Inmediato': 'Immediate',
  'Inmediato 16 bits': '16-bit Immediate',
  'Directo': 'Direct',
  'Registro Indirecto': 'Register Indirect',
}

export function getInstructionCategories(locale: string): InstructionCategory[] {
  if (locale === 'en') {
    return INSTRUCTION_CATEGORIES_EN.map(cat => ({
      ...cat,
      instructions: cat.instructions.map(inst => ({
        ...inst,
        addressing: ADDRESSING_MAP_EN[inst.addressing] || inst.addressing,
      })),
    }))
  }
  return INSTRUCTION_CATEGORIES
}
