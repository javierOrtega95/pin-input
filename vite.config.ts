import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/pin-input.ts'),

      name: 'PinInput',

      fileName: 'pin-input',

      formats: ['es', 'cjs', 'umd'],
    },
  },
})
