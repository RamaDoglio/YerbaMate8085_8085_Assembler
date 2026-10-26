# YerbaMate8085

Educational Intel 8085 simulator with assembler, step-by-step execution and PDF export. Built with Next.js + Tauri.

Simulador educativo del Intel 8085 con assembler, ejecución paso a paso y exportación a PDF. Desarrollado con Next.js + Tauri.

---

## Download & Installation / Descargas e Instalación

Download the latest version for Windows, macOS, and Linux from the [Releases page](https://github.com/RamaDoglio/YerbaMate8085_8085_Assembler/releases).

Descargá la última versión para Windows, macOS y Linux desde la página de [Releases](https://github.com/RamaDoglio/YerbaMate8085_8085_Assembler/releases).

> 📖 **For detailed download and troubleshooting instructions (especially for macOS users), please read the [Installation Guide (INSTALL.md)](INSTALL.md).**
> 
> 📖 **Para instrucciones detalladas de descarga y solución de problemas (especialmente para usuarios de macOS), leé la [Guía de Instalación (INSTALL.md)](INSTALL.md).**

---

## Features / Funcionalidades

- Full assembler with ORG, END, DB, DW, DS directives
- Syntax-highlighted code editor
- Continuous and single-step execution (F5 / F10)
- Real-time register (A, B, C, D, E, H, L), flag (Z, P, S, CY) and memory inspection
- I/O ports (input and output) with ASCII representation
- 8085 instruction and directives reference panel
- PDF export:
  - **Code template**: instruction table with addresses, OPCODEs and remarks
  - **Desk-check report**: register and flag trace after each step
- 11 preloaded example programs
- Keyboard shortcuts
- Light / Dark theme

- Ensamblador completo con directivas ORG, END, DB, DW, DS
- Editor de código con resaltado de sintaxis
- Ejecución continua y paso a paso (F5 / F10)
- Visualización de registros (A, B, C, D, E, H, L), banderas (Z, P, S, CY) y memoria
- Puertos de E/S (entrada y salida) con representación ASCII
- Panel de referencia de instrucciones y directivas del 8085
- Exportación a PDF:
  - **Plantilla del código**: tabla con instrucciones, direcciones, OPCODEs y observaciones
  - **Prueba de escritorio**: traza de registros y banderas después de cada paso
- 11 ejemplos precargados
- Atajos de teclado
- Tema claro / oscuro

---

## Requirements / Requisitos

- Windows 10+, macOS, or Linux
- WebView2 (Windows, included) / WebKitGTK (Linux)
- No additional runtime required

- Windows 10+, macOS o Linux
- WebView2 (Windows, incluido) / WebKitGTK (Linux)
- No requiere instalación de runtimes adicionales

---

## Build from source / Compilar desde fuente

```bash
pnpm install
pnpm tauri dev    # development / desarrollo
pnpm tauri build  # production / producción