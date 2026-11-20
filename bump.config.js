import { defineConfig } from 'bumpp'
import tauri from 'tauri-version'

export default defineConfig({
  files: [
    'package.json',
    'src-tauri/tauri.conf.json',
    'src-tauri/Cargo.toml'
  ],
  plugins: [
    tauri()
  ]
})