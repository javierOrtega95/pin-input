import { beforeEach, describe, expect, it } from 'vitest'
import { getInput, getPinInput, getSlots, getWrapper } from './helpers'

describe('attributes', () => {
  beforeEach(() => {
    document.body.innerHTML = '<pin-input></pin-input>'
  })

  describe('value', () => {
    it('renders initial value in the correct slots', () => {
      document.body.innerHTML = '<pin-input value="123"></pin-input>'

      const $slots = getSlots()

      expect($slots[0].textContent).toBe('1')
      expect($slots[1].textContent).toBe('2')
      expect($slots[2].textContent).toBe('3')
      expect($slots[3].textContent).toBe('')
    })

    it('reflects value changes via attribute', () => {
      const $pinInput = document.querySelector('pin-input')!
      $pinInput.setAttribute('value', '456')

      const $slots = getSlots()

      expect($slots[0].textContent).toBe('4')
      expect($slots[1].textContent).toBe('5')
      expect($slots[2].textContent).toBe('6')
    })
  })

  describe('length', () => {
    it('resets value when length changes', () => {
      document.body.innerHTML = '<pin-input value="123456"></pin-input>'

      const $pinInput = document.querySelector('pin-input')!
      $pinInput.setAttribute('length', '4')

      const $slots = getSlots()

      $slots.forEach((slot) => {
        expect(slot.textContent).toBe('')
      })
    })
  })

  describe('disabled', () => {
    beforeEach(() => {
      document.body.innerHTML = '<pin-input disabled></pin-input>'
    })

    it('sets disabled attribute on the internal input', () => {
      const $input = getInput()

      expect($input?.hasAttribute('disabled')).toBe(true)
    })

    it('sets aria-disabled on the internal input', () => {
      const $input = getInput()

      expect($input?.getAttribute('aria-disabled')).toBe('true')
    })
  })

  describe('invalid', () => {
    beforeEach(() => {
      document.body.innerHTML = '<pin-input invalid></pin-input>'
    })

    it('adds error part to all slots', () => {
      const $slots = getSlots()

      $slots.forEach((slot) => {
        expect(slot.getAttribute('part')).toContain('error')
      })
    })

    it('sets aria-invalid on the internal input', () => {
      const $input = getInput()

      expect($input?.getAttribute('aria-invalid')).toBe('true')
    })
  })

  describe('mask', () => {
    it('updates slots when mask attribute is toggled', () => {
      document.body.innerHTML = '<pin-input value="123"></pin-input>'

      const $pinInput = document.querySelector('pin-input')!
      $pinInput.setAttribute('mask', '')

      const $slots = getSlots()

      expect($slots[0].textContent).toBe('•')
      expect($slots[1].textContent).toBe('•')
      expect($slots[2].textContent).toBe('•')
    })
  })

  describe('required', () => {
    beforeEach(() => {
      document.body.innerHTML = '<pin-input required></pin-input>'
    })

    it('sets required attribute on the internal input', () => {
      const $input = getInput()

      expect($input?.hasAttribute('required')).toBe(true)
    })

    it('sets aria-required on the internal input', () => {
      const $input = getInput()

      expect($input?.getAttribute('aria-required')).toBe('true')
    })
  })

  describe('pattern', () => {
    it('rejects characters that do not match the pattern', () => {
      document.body.innerHTML = '<pin-input pattern="[a-z]"></pin-input>'

      const $input = getInput()!
      $input.focus()
      $input.value = '1'
      $input.dispatchEvent(new InputEvent('input', { bubbles: true }))

      const [$firstSlot] = getSlots()

      expect($firstSlot.textContent).toBe('')
    })
  })

  describe('separators', () => {
    it('renders the correct number of separators for multiple positions', () => {
      document.body.innerHTML = '<pin-input separators="2,4"></pin-input>'

      const $wrapper = getWrapper()!
      const $separators = $wrapper.querySelectorAll('[part="separator"]')

      expect($separators).toHaveLength(2)
    })
  })

  describe('aria-label', () => {
    beforeEach(() => {
      document.body.innerHTML = '<pin-input aria-label="Enter PIN"></pin-input>'
    })

    it('sets aria-label on the internal input', () => {
      const $input = getInput()

      expect($input?.getAttribute('aria-label')).toBe('Enter PIN')
    })

    it('sets aria-label on the wrapper', () => {
      const $wrapper = getWrapper()

      expect($wrapper?.getAttribute('aria-label')).toBe('Enter PIN')
    })
  })

  describe('aria-describedby', () => {
    it('sets aria-describedby on the internal input', () => {
      document.body.innerHTML =
        '<pin-input aria-describedby="hint"></pin-input>'

      const $input = getInput()

      expect($input?.getAttribute('aria-describedby')).toBe('hint')
    })
  })

  describe('inputmode', () => {
    it('sets inputmode="numeric" on the internal input by default', () => {
      const $input = getInput()

      expect($input?.getAttribute('inputmode')).toBe('numeric')
    })

    it('reflects a custom inputmode on the internal input', () => {
      document.body.innerHTML = '<pin-input inputmode="text"></pin-input>'

      const $input = getInput()

      expect($input?.getAttribute('inputmode')).toBe('text')
    })

    it('updates inputmode on the internal input when attribute changes', () => {
      const $pinInput = document.querySelector('pin-input')!
      $pinInput.setAttribute('inputmode', 'decimal')

      const $input = getInput()

      expect($input?.getAttribute('inputmode')).toBe('decimal')
    })
  })

  describe('setters', () => {
    it('sets length via property setter', () => {
      const $pinInput = getPinInput()!
      $pinInput.length = 4

      expect($pinInput.getAttribute('length')).toBe('4')
    })

    it('sets name via property setter', () => {
      const $pinInput = getPinInput()!
      $pinInput.name = 'otp'

      expect($pinInput.getAttribute('name')).toBe('otp')
    })

    it('sets disabled via property setter', () => {
      const $pinInput = getPinInput()!
      $pinInput.disabled = true

      expect($pinInput.hasAttribute('disabled')).toBe(true)

      $pinInput.disabled = false

      expect($pinInput.hasAttribute('disabled')).toBe(false)
    })

    it('sets mask via property setter', () => {
      const $pinInput = getPinInput()!
      $pinInput.mask = true

      expect($pinInput.hasAttribute('mask')).toBe(true)

      $pinInput.mask = false

      expect($pinInput.hasAttribute('mask')).toBe(false)
    })
  })
})
