import { describe, it, expect, beforeEach } from 'vitest'
import { getSlots, getInput, getWrapper } from './helpers'

describe('rendering', () => {
  beforeEach(() => {
    document.body.innerHTML = '<pin-input></pin-input>'
  })

  it('renders the correct number of slots by default', () => {
    const $slots = getSlots()

    expect($slots).toHaveLength(6)
  })

  it('renders the correct number of slots according to length attribute', () => {
    document.body.innerHTML = '<pin-input length="4"></pin-input>'

    const $slots = getSlots()

    expect($slots).toHaveLength(4)
  })

  it('renders slots empty by default', () => {
    const $slots = getSlots()

    $slots.forEach((slot) => {
      expect(slot.textContent).toBe('')
    })
  })

  it('renders the input inside the shadow DOM', () => {
    const $input = getInput()

    expect($input).not.toBeNull()
  })

  it('renders the wrapper with role group', () => {
    const $wrapper = getWrapper()

    expect($wrapper?.getAttribute('role')).toBe('group')
  })

  it('renders separators in the correct positions', () => {
    document.body.innerHTML = '<pin-input separators="3"></pin-input>'

    const $slots = getSlots()
    const $thirdSlot = $slots[2]
    const $nextSibling = $thirdSlot?.nextElementSibling

    expect($nextSibling?.getAttribute('part')).toBe('separator')
  })

  it('renders cursor in active empty slot when focused', async () => {
    const $input = getInput()
    $input?.focus()

    const [$firstSlot] = getSlots()
    const $cursor = $firstSlot?.querySelector('[part="cursor"]')

    expect($cursor).not.toBeNull()
  })

  it('renders input with autocomplete one-time-code by default', () => {
    const $input = getInput()

    expect($input?.getAttribute('autocomplete')).toBe('one-time-code')
  })

  it('renders input as visually hidden', () => {
    const $input = getInput()

    const styles = getComputedStyle($input!)

    expect(styles.opacity).toBe('0')
  })
})
