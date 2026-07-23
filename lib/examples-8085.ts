export interface ExampleProgram {
  name: string
  description: string
  code: string
}

const EXAMPLE_PROGRAMS_ES: ExampleProgram[] = [
  {
    name: 'Aritmética Básica',
    description: 'Suma dos números y almacena el resultado',
    code: `; Aritmetica basica - suma dos numeros
; Demuestra: MVI, ADD, STA

ORG 0000H

START:
    MVI A, 25H  ; Cargar 25H en el acumulador
    MVI B, 1AH  ; Cargar 1AH en el registro B
    ADD B       ; Sumar B a A (resultado en A)
    STA 2050H   ; Almacenar A en la direccion 2050H

    MVI C, 05H  ; Contador = 5

LOOP:
    DCR C       ; Decrementar contador
    JNZ LOOP    ; Saltar si no es cero

    HLT

ORG 2050H
RESULT: DB 00H
`,
  },
  {
    name: 'Transferencia de Datos',
    description: 'Demuestra LDA, STA, LHLD, SHLD, XCHG',
    code: `; Operaciones de transferencia de datos
; Demuestra: LDA, STA, LHLD, SHLD, XCHG, LDAX, STAX

ORG 0000H

    MVI A, 42H  ; Cargar A con un valor
    STA 2000H   ; Almacenar A directamente en memoria

    LXI H, 3000H ; HL apunta a 3000H
    MVI M, 55H   ; Almacenar 55H en memoria[HL]

    LXI B, 2000H ; BC apunta a 2000H
    LDAX B       ; A = memoria[BC] (carga 42H)

    LHLD 2000H  ; L = mem[2000H], H = mem[2001H]
    SHLD 2002H  ; mem[2002H] = L, mem[2003H] = H

    XCHG         ; Intercambiar HL con DE

    HLT
`,
  },
  {
    name: 'Bucles y Saltos',
    description: 'Bucle con contador usando saltos condicionales',
    code: `; Ejemplo de bucles y saltos
; Demuestra: JNZ, JZ, JC, JMP, INR, DCR

ORG 0000H

    MVI A, 00H  ; Inicializar suma = 0
    MVI B, 0AH  ; Bucle 10 veces

LOOP:
    ADD B       ; A = A + B
    DCR B       ; B--
    JNZ LOOP    ; Continuar si B != 0

    ; En este punto A = 0x37 (suma de 10+9+...+1)
    STA 3000H   ; Almacenar resultado

    ; Verificar si el resultado es cero
    CPI 00H
    JZ CERO
    MVI A, 01H  ; No es cero
    JMP FIN

CERO:
    MVI A, 00H

FIN:
    STA 3001H

    HLT
`,
  },
  {
    name: 'Operaciones de Pila',
    description: 'Demuestra PUSH, POP, CALL, RET y uso de la pila',
    code: `; Operaciones de pila
; Demuestra: CALL, RET, PUSH, POP, XTHL, SPHL

ORG 0000H

    LXI SP, 5000H ; Inicializar puntero de pila

    MVI A, 10H
    MVI B, 20H
    MVI C, 30H

    CALL SUMAR_VALORES ; Llamar a subrutina

    HLT

; Subrutina: sumar registros y almacenar
SUMAR_VALORES:
    PUSH B      ; Guardar BC en la pila
    PUSH PSW    ; Guardar A y banderas

    ADD B       ; A = A + B
    ADD C       ; A = A + C
    STA 4000H   ; Almacenar resultado

    POP PSW     ; Restaurar A y banderas
    POP B       ; Restaurar BC
    RET         ; Retornar al llamante
`,
  },
  {
    name: 'Lógicas y Rotaciones',
    description: 'Demuestra AND, OR, XOR, complemento y rotaciones',
    code: `; Operaciones logicas y rotaciones
; Demuestra: ANA, ORA, XRA, CMA, RLC, RRC, RAL, RAR, CMC, STC

ORG 0000H

    MVI A, 0F0H ; Cargar 11110000b

    ANA A       ; A = A AND A (sin cambio, pone banderas)
    CMA         ; A = NOT A = 0F0Fh
    STA 2000H   ; Almacenar resultado

    MVI A, 0F0H
    ORI 0FH     ; A = 0FFh

    MVI B, 55H  ; 01010101b
    MVI A, 0AAH ; 10101010b
    XRA B       ; A = FFh (XOR)

    MVI A, 80H
    RLC         ; Rotar izq: CY=1, A=01H
    RRC         ; Rotar der: CY=0, A=80H
    RAL         ; Rotar izq a traves de acarreo
    RAR         ; Rotar der a traves de acarreo

    STC         ; Poner acarreo a 1
    CMC         ; Complementar acarreo

    HLT
`,
  },
  {
    name: 'Aritmética BCD',
    description: 'Demuestra DAA para suma BCD',
    code: `; Aritmetica BCD con DAA
; Demuestra: DAA, suma BCD

ORG 0000H

    ; Sumar dos numeros BCD: 48 + 37 = 85
    MVI A, 48H  ; Primer numero BCD
    MVI B, 37H  ; Segundo numero BCD
    ADD B       ; Suma binaria: 48h + 37h = 7Fh
    DAA         ; Ajuste decimal: 7Fh -> 85h (BCD correcto)
    STA 3000H   ; Almacenar resultado BCD

    ; Otro ejemplo: 19 + 28 = 47
    MVI A, 19H
    MVI B, 28H
    ADD B
    DAA
    STA 3001H

    ; Con acarreo: 95 + 37 = 132 (con acarreo)
    MVI A, 95H
    MVI B, 37H
    ADD B
    DAA
    STA 3002H  ; Byte bajo = 32h
    ; CY indica acarreo = 01h (resultado = 132)

    HLT
`,
  },
  {
    name: 'Copia de Bloque de Memoria',
    description: 'Copia un bloque de memoria usando LDAX/STAX con INX/DCX',
    code: `; Copia de bloque de memoria
; Demuestra: LXI, LDAX, STAX, INX, DCX, JNZ

ORG 0000H

    ; Copiar 16 bytes de 2000h a 3000h
    LXI H, 2000H ; Direccion origen
    LXI D, 3000H ; Direccion destino
    MVI C, 10H   ; Contador = 16 bytes

LOOP_COPIA:
    MOV A, M     ; Leer de origen
    STAX D       ; Escribir en destino
    INX H        ; Avanzar origen
    INX D        ; Avanzar destino
    DCR C        ; Decrementar contador
    JNZ LOOP_COPIA ; Repetir hasta terminar

    HLT

; Datos de origen
ORG 2000H
    DB 10H, 20H, 30H, 40H, 50H, 60H, 70H, 80H
    DB 90H, 0A0H, 0B0H, 0C0H, 0D0H, 0E0H, 0F0H, 0FFH
`,
  },
  {
    name: 'Aritmética de 16 bits',
    description: 'Demuestra DAD para suma de 16 bits y operaciones con pares de registros',
    code: `; Aritmetica de 16 bits
; Demuestra: DAD, INX, DCX, LXI con pares de registros

ORG 0000H

    ; Sumar BC a HL: HL = HL + BC
    LXI H, 1234H ; HL = 1234h
    LXI B, 4321H ; BC = 4321h
    DAD B        ; HL = 5555h

    ; Sumar DE a HL
    LXI D, 0ABCDH ; DE = ABCDh
    DAD D         ; HL = 5555h + ABCDh = 10022h -> 0022h, CY=1

    ; Incremento/decremento de 16 bits (no afecta banderas)
    INX B        ; BC = 4322h
    INX D        ; DE = ABCEh
    DCX H        ; HL = 0021h
    DCX B        ; BC = 4321h

    ; Almacenar resultado de 16 bits
    SHLD 5000H   ; mem[5000h] = L, mem[5001h] = H

    HLT
`,
  },
  {
    name: 'Visualización de Cadena',
    description: 'Escribe una cadena en memoria y la copia (ASCII)',
    code: `; Visualizacion de cadena
; Demuestra: DB con cadenas, operaciones de memoria

ORG 0000H

    LXI H, MENSAJE  ; HL apunta a la cadena
    LXI D, 6000H    ; Buffer destino

COPIAR_CAD:
    MOV A, M      ; Cargar caracter
    CPI 00H       ; Verificar terminador nulo
    JZ FIN
    STAX D
    INX H
    INX D
    JMP COPIAR_CAD

FIN:
    HLT

MENSAJE:
    DB "HELLO 8085!", 00H
`,
  },
  {
    name: 'Librería de Subrutinas',
    description: 'Múltiples subrutinas llamadas condicionalmente (CZ, CNZ, CC, CNC)',
    code: `; Libreria de subrutinas
; Demuestra: CALL y RET condicionales (CZ, CNZ, CC, CNC)

ORG 0000H

    LXI SP, 7000H ; Configurar pila

    MVI A, 05H
    CPI 05H
    CZ ENCONTRADO_CERO ; Llamada si A == 5

    MVI A, 00H
    CPI 00H
    CNZ NO_CERO  ; NO llamada (A es cero)

    MVI A, 0FFH
    CPI 0AAH
    CC HAY_ACARREO  ; Llamada si A < 0AAh (CY=1)
    CNC SIN_ACARREO ; NO llamada

    HLT

ENCONTRADO_CERO:
    MVI B, 01H
    RET

NO_CERO:
    MVI B, 02H
    RET

HAY_ACARREO:
    MVI B, 03H
    RET

SIN_ACARREO:
    MVI B, 04H
    RET
`,
  },
]

const EXAMPLE_PROGRAMS_EN: ExampleProgram[] = [
  {
    name: 'Basic Arithmetic',
    description: 'Adds two numbers and stores the result',
    code: `; Basic arithmetic - sum two numbers
; Demonstrates: MVI, ADD, STA

ORG 0000H

START:
    MVI A, 25H  ; Load 25H into accumulator
    MVI B, 1AH  ; Load 1AH into register B
    ADD B       ; Add B to A (result in A)
    STA 2050H   ; Store A at address 2050H

    MVI C, 05H  ; Counter = 5

LOOP:
    DCR C       ; Decrement counter
    JNZ LOOP    ; Jump if not zero

    HLT

ORG 2050H
RESULT: DB 00H
`,
  },
  {
    name: 'Data Transfer',
    description: 'Demonstrates LDA, STA, LHLD, SHLD, XCHG',
    code: `; Data transfer operations
; Demonstrates: LDA, STA, LHLD, SHLD, XCHG, LDAX, STAX

ORG 0000H

    MVI A, 42H  ; Load A with a value
    STA 2000H   ; Store A directly to memory

    LXI H, 3000H ; HL points to 3000H
    MVI M, 55H   ; Store 55H at mem[HL]

    LXI B, 2000H ; BC points to 2000H
    LDAX B       ; A = mem[BC] (loads 42H)

    LHLD 2000H  ; L = mem[2000H], H = mem[2001H]
    SHLD 2002H  ; mem[2002H] = L, mem[2003H] = H

    XCHG         ; Exchange HL with DE

    HLT
`,
  },
  {
    name: 'Loops and Jumps',
    description: 'Counter loop using conditional jumps',
    code: `; Loop and jump example
; Demonstrates: JNZ, JZ, JC, JMP, INR, DCR

ORG 0000H

    MVI A, 00H  ; Initialize sum = 0
    MVI B, 0AH  ; Loop 10 times

LOOP:
    ADD B       ; A = A + B
    DCR B       ; B--
    JNZ LOOP    ; Continue if B != 0

    ; At this point A = 0x37 (sum of 10+9+...+1)
    STA 3000H   ; Store result

    ; Check if result is zero
    CPI 00H
    JZ CERO
    MVI A, 01H  ; Not zero
    JMP FIN

CERO:
    MVI A, 00H

FIN:
    STA 3001H

    HLT
`,
  },
  {
    name: 'Stack Operations',
    description: 'Demonstrates PUSH, POP, CALL, RET and stack usage',
    code: `; Stack operations
; Demonstrates: CALL, RET, PUSH, POP, XTHL, SPHL

ORG 0000H

    LXI SP, 5000H ; Initialize stack pointer

    MVI A, 10H
    MVI B, 20H
    MVI C, 30H

    CALL SUMAR_VALORES ; Call subroutine

    HLT

; Subroutine: sum registers and store
SUMAR_VALORES:
    PUSH B      ; Save BC on stack
    PUSH PSW    ; Save A and flags

    ADD B       ; A = A + B
    ADD C       ; A = A + C
    STA 4000H   ; Store result

    POP PSW     ; Restore A and flags
    POP B       ; Restore BC
    RET         ; Return to caller
`,
  },
  {
    name: 'Logical and Rotate',
    description: 'Demonstrates AND, OR, XOR, complement and rotates',
    code: `; Logical operations and rotates
; Demonstrates: ANA, ORA, XRA, CMA, RLC, RRC, RAL, RAR, CMC, STC

ORG 0000H

    MVI A, 0F0H ; Load 11110000b

    ANA A       ; A = A AND A (no change, sets flags)
    CMA         ; A = NOT A = 0F0Fh
    STA 2000H   ; Store result

    MVI A, 0F0H
    ORI 0FH     ; A = 0FFh

    MVI B, 55H  ; 01010101b
    MVI A, 0AAH ; 10101010b
    XRA B       ; A = FFh (XOR)

    MVI A, 80H
    RLC         ; Rotate left: CY=1, A=01H
    RRC         ; Rotate right: CY=0, A=80H
    RAL         ; Rotate left through carry
    RAR         ; Rotate right through carry

    STC         ; Set carry to 1
    CMC         ; Complement carry

    HLT
`,
  },
  {
    name: 'BCD Arithmetic',
    description: 'Demonstrates DAA for BCD addition',
    code: `; BCD arithmetic with DAA
; Demonstrates: DAA, BCD addition

ORG 0000H

    ; Add two BCD numbers: 48 + 37 = 85
    MVI A, 48H  ; First BCD number
    MVI B, 37H  ; Second BCD number
    ADD B       ; Binary sum: 48h + 37h = 7Fh
    DAA         ; Decimal adjust: 7Fh -> 85h (correct BCD)
    STA 3000H   ; Store BCD result

    ; Another example: 19 + 28 = 47
    MVI A, 19H
    MVI B, 28H
    ADD B
    DAA
    STA 3001H

    ; With carry: 95 + 37 = 132 (with carry)
    MVI A, 95H
    MVI B, 37H
    ADD B
    DAA
    STA 3002H  ; Low byte = 32h
    ; CY indicates carry = 01h (result = 132)

    HLT
`,
  },
  {
    name: 'Memory Block Copy',
    description: 'Copies a memory block using LDAX/STAX with INX/DCX',
    code: `; Memory block copy
; Demonstrates: LXI, LDAX, STAX, INX, DCX, JNZ

ORG 0000H

    ; Copy 16 bytes from 2000h to 3000h
    LXI H, 2000H ; Source address
    LXI D, 3000H ; Destination address
    MVI C, 10H   ; Counter = 16 bytes

LOOP_COPIA:
    MOV A, M     ; Read from source
    STAX D       ; Write to destination
    INX H        ; Advance source
    INX D        ; Advance destination
    DCR C        ; Decrement counter
    JNZ LOOP_COPIA ; Repeat until done

    HLT

; Source data
ORG 2000H
    DB 10H, 20H, 30H, 40H, 50H, 60H, 70H, 80H
    DB 90H, 0A0H, 0B0H, 0C0H, 0D0H, 0E0H, 0F0H, 0FFH
`,
  },
  {
    name: '16-bit Arithmetic',
    description: 'Demonstrates DAD for 16-bit addition and register pair operations',
    code: `; 16-bit arithmetic
; Demonstrates: DAD, INX, DCX, LXI with register pairs

ORG 0000H

    ; Add BC to HL: HL = HL + BC
    LXI H, 1234H ; HL = 1234h
    LXI B, 4321H ; BC = 4321h
    DAD B        ; HL = 5555h

    ; Add DE to HL
    LXI D, 0ABCDH ; DE = ABCDh
    DAD D         ; HL = 5555h + ABCDh = 10022h -> 0022h, CY=1

    ; 16-bit increment/decrement (does not affect flags)
    INX B        ; BC = 4322h
    INX D        ; DE = ABCEh
    DCX H        ; HL = 0021h
    DCX B        ; BC = 4321h

    ; Store 16-bit result
    SHLD 5000H   ; mem[5000h] = L, mem[5001h] = H

    HLT
`,
  },
  {
    name: 'String Display',
    description: 'Writes a string to memory and copies it (ASCII)',
    code: `; String display
; Demonstrates: DB with strings, memory operations

ORG 0000H

    LXI H, MENSAJE  ; HL points to the string
    LXI D, 6000H    ; Destination buffer

COPIAR_CAD:
    MOV A, M      ; Load character
    CPI 00H       ; Check null terminator
    JZ FIN
    STAX D
    INX H
    INX D
    JMP COPIAR_CAD

FIN:
    HLT

MENSAJE:
    DB "HELLO 8085!", 00H
`,
  },
  {
    name: 'Subroutine Library',
    description: 'Multiple subroutines called conditionally (CZ, CNZ, CC, CNC)',
    code: `; Subroutine library
; Demonstrates: Conditional CALL and RET (CZ, CNZ, CC, CNC)

ORG 0000H

    LXI SP, 7000H ; Set up stack

    MVI A, 05H
    CPI 05H
    CZ ENCONTRADO_CERO ; Call if A == 5

    MVI A, 00H
    CPI 00H
    CNZ NO_CERO  ; NO call (A is zero)

    MVI A, 0FFH
    CPI 0AAH
    CC HAY_ACARREO  ; Call if A < 0AAh (CY=1)
    CNC SIN_ACARREO ; NO call

    HLT

ENCONTRADO_CERO:
    MVI B, 01H
    RET

NO_CERO:
    MVI B, 02H
    RET

HAY_ACARREO:
    MVI B, 03H
    RET

SIN_ACARREO:
    MVI B, 04H
    RET
`,
  },
]

export function getExamples(locale: string): ExampleProgram[] {
  return locale === 'en' ? EXAMPLE_PROGRAMS_EN : EXAMPLE_PROGRAMS_ES
}
