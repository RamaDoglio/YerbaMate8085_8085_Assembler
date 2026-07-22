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
