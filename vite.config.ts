import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/pin-input.ts'),

      name: 'PinInput',

      fileName: 'pin-input',

      formats: ['es', 'cjs', 'umd'],
    },
  },
  test: {
    setupFiles: ['./tests/setup.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
})
