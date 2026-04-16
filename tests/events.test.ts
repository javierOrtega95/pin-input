import { describe, it, expect, beforeEach, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { getPinInput } from './helpers'

describe('events', () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<pin-input style="display:block;width:300px;height:60px;"></pin-input>'
  })

  describe('pin-change', () => {
    it('emits pin-change with the correct value when typing', async () => {
      const $pinInput = getPinInput()!
      const handler = vi.fn()

      $pinInput.addEventListener('pin-change', handler)

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')

      expect(handler).toHaveBeenCalledTimes(3)

      const values = handler.mock.calls.map((call) => call[0].detail.value)
      expect(values).toEqual(['1', '12', '123'])
    })

    it('does not emit pin-change when value does not change', async () => {
      const $pinInput = getPinInput()!
      const handler = vi.fn()

      $pinInput.addEventListener('pin-change', handler)

      await userEvent.click($pinInput)
      await userEvent.keyboard('1')
      await userEvent.click(document.body)
      await userEvent.click($pinInput)

      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('pin-complete', () => {
    it('emits pin-complete when all slots are filled', async () => {
      const $pinInput = getPinInput()!
      const handler = vi.fn()

      $pinInput.addEventListener('pin-complete', handler)

      await userEvent.click($pinInput)
      await userEvent.keyboard('123456')

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler.mock.calls[0][0].detail.value).toBe('123456')
    })

    it('does not emit pin-complete when value is incomplete', async () => {
      const $pinInput = getPinInput()!
      const handler = vi.fn()

      $pinInput.addEventListener('pin-complete', handler)

      await userEvent.click($pinInput)
      await userEvent.keyboard('12345')

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('mask', () => {
    it('emits the real value in pin-complete even when mask is active', async () => {
      document.body.innerHTML =
        '<pin-input mask style="display:block;width:300px;height:60px;"></pin-input>'

      const $pinInput = getPinInput()!
      const handler = vi.fn()

      $pinInput.addEventListener('pin-complete', handler)

      await userEvent.click($pinInput)
      await userEvent.keyboard('123456')

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler.mock.calls[0][0].detail.value).toBe('123456')
    })
  })
})
