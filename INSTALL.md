# Installation Guide / Guía de Instalación — YerbaMate8085

This guide is for users who want to download and use the simulator without building it from source.
Esta guía está pensada para usuarios que quieran descargar y usar el simulador sin necesidad de compilar el código.

---

## 1. Download the correct file / Descargar el archivo correcto

Go to the **[Releases](https://github.com/RamaDoglio/YerbaMate8085_8085_Assembler/releases)** section on GitHub and download the file for your operating system.
Andá a la sección de **[Releases](https://github.com/RamaDoglio/YerbaMate8085_8085_Assembler/releases)** en GitHub y descargá el archivo que corresponda a tu sistema operativo:

### Windows
- **`YerbaMate8085-Windows-x64_portable.exe`**: No installation required, just run it. / No requiere instalación, solo hacés doble clic y corre.
- **`YerbaMate8085_..._x64_en-US.msi`**: Standard installer (creates a Start Menu shortcut). / Instalador tradicional (crea el acceso directo).

### macOS (Apple / Mac)
- **`YerbaMate8085_..._aarch64.dmg`**: For modern Macs with **Apple Silicon (M1, M2, M3, M4)** chips.
  *(If you have an older Intel Mac, please let us know so we can compile a specific version).*
- **`YerbaMate8085_..._aarch64.dmg`**: Para Macs modernas con chip **Apple Silicon (M1, M2, M3, M4)**.
  *(Nota: Si tenés una Mac vieja con procesador Intel, avisanos para compilar una versión especial).*

> ⚠️ **macOS Gatekeeper Warning / Advertencia para macOS**:
> Because this is an open-source app without a paid Apple Developer license, macOS may block it the first time.
> **Solution**: **Right-click** (or `Ctrl + click`) the `.dmg` file and select **"Open"**. Then click "Open" again on the warning prompt.
> *(If it says "App is damaged", open Terminal and run: `xattr -cr /Applications/YerbaMate8085.app`)*
> 
> Como es una app de código abierto sin licencia paga de Apple, macOS puede bloquearla la primera vez.
> **Solución**: Hacé **clic derecho** (o `Ctrl + clic`) sobre el archivo `.dmg` y elegí **"Abrir"**. Luego dale a "Abrir" de nuevo en el cartel de advertencia.
> *(Si dice "App dañada", abrí la Terminal y ejecutá: `xattr -cr /Applications/YerbaMate8085.app`)*

### Linux
- **`YerbaMate8085_..._amd64.deb`**: For Ubuntu, Debian, Linux Mint, Pop!_OS, etc. / Para Ubuntu, Debian, Linux Mint, Pop!_OS, etc.
- **`YerbaMate8085-...1.x86_64.rpm`**: For Fedora, Red Hat, openSUSE. / Para Fedora, Red Hat, openSUSE.
- **`YerbaMate8085_..._amd64.AppImage`**: For any other distribution. / Para cualquier otra distribución.
  *(Give execution permissions with `chmod +x file.AppImage` and double-click. / Dar permisos con `chmod +x archivo.AppImage` y hacer doble clic).*

---

## 2. First steps / Primeros pasos

Once the application is open:
1. Choose a preloaded example from the dropdown menu in the top-left corner of the editor.
2. Click **Assemble** (or press `F7`).
3. Click **Run** (`F5`) or **Step** (`F10`).
4. You can export the code and the desk-check to PDF using the Export button.

Una vez abierta la aplicación:
1. Elegí un ejemplo del menú desplegable en la esquina superior izquierda del editor.
2. Hacé clic en **Ensamblar** (o presioná `F7`).
3. Hacé clic en **Ejecutar** (`F5`) o **Paso a Paso** (`F10`).
4. Podés exportar el código y la prueba de escritorio a PDF desde el botón de Exportar.