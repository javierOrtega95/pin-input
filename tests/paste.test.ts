import { describe, it, expect, beforeEach } from 'vitest'
import { getPinInput, getSlots, getInput, simulatePaste } from './helpers'
import { userEvent } from 'vitest/browser'

describe('paste', () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<pin-input style="display:block;width:300px;height:60px;"></pin-input>'
  })

  it('distributes pasted value across slots from the start', () => {
    const $input = getInput()!

    simulatePaste($input, '123456')

    const $slots = getSlots()

    expect($slots[0].textContent).toBe('1')
    expect($slots[1].textContent).toBe('2')
    expect($slots[2].textContent).toBe('3')
  })

  it('filters invalid characters when pasting', () => {
    const $input = getInput()!

    simulatePaste($input, '1a2b3')

    const $slots = getSlots()

    expect($slots[0].textContent).toBe('1')
    expect($slots[1].textContent).toBe('2')
    expect($slots[2].textContent).toBe('3')
  })

  it('truncates pasted value to length', () => {
    const $input = getInput()!

    simulatePaste($input, '12345678')

    expect($input?.value.length).toBeLessThanOrEqual(6)
  })

  it('pastes from cursor position', async () => {
    const $pinInput = getPinInput()!

    await userEvent.click($pinInput)
    await userEvent.keyboard('12')
    await userEvent.keyboard('{ArrowLeft}')

    const $input = getInput()!
    simulatePaste($input, '99')

    const $slots = getSlots()

    expect($slots[0].textContent).toBe('1')
    expect($slots[1].textContent).toBe('9')
    expect($slots[2].textContent).toBe('9')
  })
})
