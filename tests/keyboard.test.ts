import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { getInput, getPinInput, getSlots } from './helpers'

describe('keyboard', () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<pin-input style="display:block;width:300px;height:60px;"></pin-input>'
  })

  describe('typing', () => {
    it('types a valid character into the first slot', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('1')

      const [$firstSlot] = getSlots()

      expect($firstSlot.textContent).toBe('1')
    })

    it('distributes characters across consecutive slots', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')

      const $slots = getSlots()

      expect($slots[0].textContent).toBe('1')
      expect($slots[1].textContent).toBe('2')
      expect($slots[2].textContent).toBe('3')
    })

    it('does not add invalid characters', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('a')

      const [$firstSlot] = getSlots()

      expect($firstSlot.textContent).toBe('')
    })

    it('does not exceed the length limit', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('1234567')

      const $input = getInput()

      expect($input?.value.length).toBeLessThanOrEqual(6)
    })
  })

  describe('backspace', () => {
    it('deletes the previous character when current slot is empty', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('1')
      await userEvent.keyboard('{Backspace}')

      const [$firstSlot] = getSlots()

      expect($firstSlot.textContent).toBe('')
    })

    it('deletes the character at the current position', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')
      await userEvent.keyboard('{ArrowLeft}')
      await userEvent.keyboard('{Backspace}')

      const $slots = getSlots()

      expect($slots[0].textContent).toBe('1')
      expect($slots[1].textContent).toBe('2')
      expect($slots[2].textContent).toBe('')
    })

    it('does nothing when the value is empty', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('{Backspace}')

      const $slots = getSlots()

      $slots.forEach((slot) => {
        expect(slot.textContent).toBe('')
      })
    })
  })

  describe('delete', () => {
    it('deletes the character at the current position', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')
      await userEvent.keyboard('{ArrowLeft}')
      await userEvent.keyboard('{Delete}')

      const $slots = getSlots()

      expect($slots[0].textContent).toBe('1')
      expect($slots[1].textContent).toBe('2')
      expect($slots[2].textContent).toBe('')
    })

    it('cursor stays at the same position after delete', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')
      await userEvent.keyboard('{ArrowLeft}')
      await userEvent.keyboard('{Delete}')

      expect(getInput()?.selectionStart).toBe(2)
    })

    it('does nothing when cursor is past the last filled slot', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')
      await userEvent.keyboard('{Delete}')

      const $slots = getSlots()

      expect($slots[0].textContent).toBe('1')
      expect($slots[1].textContent).toBe('2')
      expect($slots[2].textContent).toBe('3')
    })
  })

  describe('horizontal arrows', () => {
    it('moves cursor to the next slot with ArrowRight', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('12')
      await userEvent.keyboard('{ArrowLeft}')
      await userEvent.keyboard('{ArrowRight}')

      expect(getInput()?.selectionStart).toBe(2)
    })

    it('moves cursor to the previous slot with ArrowLeft', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('12')
      await userEvent.keyboard('{ArrowLeft}')

      expect(getInput()?.selectionStart).toBe(1)
    })

    it('does nothing when ArrowLeft at position 0', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('{ArrowLeft}')

      expect(getInput()?.selectionStart).toBe(0)
    })

    it('does nothing when ArrowRight at last filled slot', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')
      await userEvent.keyboard('{ArrowRight}')

      expect(getInput()?.selectionStart).toBe(3)
    })
  })

  describe('jump to start/end', () => {
    it('jumps to the first slot with Home', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')
      await userEvent.keyboard('{Home}')

      expect(getInput()?.selectionStart).toBe(0)
    })

    it('jumps to the last filled slot with End', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')
      await userEvent.keyboard('{ArrowLeft}')
      await userEvent.keyboard('{End}')

      expect(getInput()?.selectionStart).toBe(3)
    })

    it('jumps to the first slot with ArrowUp', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')
      await userEvent.keyboard('{ArrowUp}')

      expect(getInput()?.selectionStart).toBe(0)
    })

    it('jumps to the last filled slot with ArrowDown', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')
      await userEvent.keyboard('{ArrowLeft}')
      await userEvent.keyboard('{ArrowDown}')

      expect(getInput()?.selectionStart).toBe(3)
    })

    it('jumps to the first slot with Ctrl+ArrowLeft', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')
      await userEvent.keyboard('{Control>}{ArrowLeft}{/Control}')

      expect(getInput()?.selectionStart).toBe(0)
    })

    it('jumps to the last filled slot with Ctrl+ArrowRight', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')
      await userEvent.keyboard('{ArrowLeft}')
      await userEvent.keyboard('{Control>}{ArrowRight}{/Control}')

      expect(getInput()?.selectionStart).toBe(3)
    })
  })

  describe('cut (Ctrl+X)', () => {
    let writeText: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      writeText = vi
        .spyOn(navigator.clipboard, 'writeText')
        .mockResolvedValue()
    })

    afterEach(() => {
      writeText.mockRestore()
    })

    it('clears all slots with Ctrl+A + Ctrl+X', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')
      await userEvent.keyboard('{Control>}a{/Control}')
      await userEvent.keyboard('{Control>}x{/Control}')

      const $slots = getSlots()

      $slots.forEach((slot) => {
        expect(slot.textContent).toBe('')
      })
    })

    it('copies value to clipboard with Ctrl+A + Ctrl+X', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')
      await userEvent.keyboard('{Control>}a{/Control}')
      await userEvent.keyboard('{Control>}x{/Control}')

      expect(writeText).toHaveBeenCalledWith('123')
    })

    it('does nothing with Ctrl+X without selection', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')
      await userEvent.keyboard('{Control>}x{/Control}')

      const $slots = getSlots()

      expect($slots[0].textContent).toBe('1')
      expect($slots[1].textContent).toBe('2')
      expect($slots[2].textContent).toBe('3')
    })

    it('does nothing with Ctrl+X when input is empty', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('{Control>}x{/Control}')

      const $slots = getSlots()

      $slots.forEach((slot) => {
        expect(slot.textContent).toBe('')
      })
    })
  })

  describe('selection', () => {
    it('selects all filled slots with Ctrl+A', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')
      await userEvent.keyboard('{Control>}a{/Control}')

      const $slots = getSlots()

      $slots.slice(0, 3).forEach((slot) => {
        expect(slot.getAttribute('part')).toContain('selected')
      })
    })

    it('does nothing with Ctrl+A when input is empty', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('{Control>}a{/Control}')

      const $slots = getSlots()

      $slots.forEach((slot) => {
        expect(slot.getAttribute('part')).not.toContain('selected')
      })
    })

    it('clears all slots with Ctrl+A + Backspace', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')
      await userEvent.keyboard('{Control>}a{/Control}')
      await userEvent.keyboard('{Backspace}')

      const $slots = getSlots()

      $slots.forEach((slot) => {
        expect(slot.textContent).toBe('')
      })
    })

    it('replaces all slots writing after Ctrl+A', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')
      await userEvent.keyboard('{Control>}a{/Control}')
      await userEvent.keyboard('7')

      const $slots = getSlots()

      expect($slots[0].textContent).toBe('7')
      expect($slots[1].textContent).toBe('')
      expect($slots[2].textContent).toBe('')
    })

    it('selects all filled slots with double click', async () => {
      const $pinInput = getPinInput()!

      await userEvent.click($pinInput)
      await userEvent.keyboard('123')
      await userEvent.dblClick($pinInput)

      const $slots = getSlots()

      $slots.slice(0, 3).forEach((slot) => {
        expect(slot.getAttribute('part')).toContain('selected')
      })
    })
  })
})
