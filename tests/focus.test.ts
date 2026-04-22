import { describe, it, expect } from 'vitest'
import { userEvent } from 'vitest/browser'
import { getInput, getPinInput } from './helpers'

describe('focus', () => {
  it('places cursor at position 0 when input is empty', async () => {
    document.body.innerHTML =
      '<pin-input style="display:block;width:300px;height:60px;"></pin-input>'

    await userEvent.click(getPinInput()!)

    expect(getInput()?.selectionStart).toBe(0)
  })

  it('places cursor at the next empty slot when input is partially filled', async () => {
    document.body.innerHTML =
      '<pin-input value="123" style="display:block;width:300px;height:60px;"></pin-input>'

    await userEvent.click(getPinInput()!)

    expect(getInput()?.selectionStart).toBe(3)
  })

  it('places cursor at the last slot when input is completely filled', async () => {
    document.body.innerHTML =
      '<pin-input value="123456" style="display:block;width:300px;height:60px;"></pin-input>'

    await userEvent.click(getPinInput()!)

    // capped at length - 1 so the last slot stays active
    expect(getInput()?.selectionStart).toBe(5)
  })
})
