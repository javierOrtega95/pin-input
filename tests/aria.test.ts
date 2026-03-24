import { describe, it, expect, beforeEach } from 'vitest'
import { getPinInput, getInput, getWrapper } from './helpers'

describe('aria', () => {
  beforeEach(() => {
    document.body.innerHTML = '<pin-input></pin-input>'
  })

  it('wrapper has role group', () => {
    const $wrapper = getWrapper()

    expect($wrapper?.getAttribute('role')).toBe('group')
  })

  it('updates aria-invalid dynamically when invalid attribute changes', () => {
    const $pinInput = getPinInput()!
    const $input = getInput()

    expect($input?.getAttribute('aria-invalid')).toBe('false')

    $pinInput.setAttribute('invalid', '')

    expect($input?.getAttribute('aria-invalid')).toBe('true')

    $pinInput.removeAttribute('invalid')

    expect($input?.getAttribute('aria-invalid')).toBe('false')
  })

  it('updates aria-required dynamically when required attribute changes', () => {
    const $pinInput = getPinInput()!
    const $input = getInput()

    expect($input?.getAttribute('aria-required')).toBe('false')

    $pinInput.setAttribute('required', '')

    expect($input?.getAttribute('aria-required')).toBe('true')
  })

  it('updates aria-disabled dynamically when disabled attribute changes', () => {
    const $pinInput = getPinInput()!
    const $input = getInput()

    expect($input?.getAttribute('aria-disabled')).toBe('false')

    $pinInput.setAttribute('disabled', '')

    expect($input?.getAttribute('aria-disabled')).toBe('true')
  })

  it('updates aria-label dynamically on input and wrapper', () => {
    const $pinInput = getPinInput()!
    const $input = getInput()
    const $wrapper = getWrapper()

    $pinInput.setAttribute('aria-label', 'Enter PIN')

    expect($input?.getAttribute('aria-label')).toBe('Enter PIN')
    expect($wrapper?.getAttribute('aria-label')).toBe('Enter PIN')
  })

  it('removes aria-label when attribute is removed', () => {
    const $pinInput = getPinInput()!
    const $input = getInput()
    const $wrapper = getWrapper()

    $pinInput.setAttribute('aria-label', 'Enter PIN')
    $pinInput.removeAttribute('aria-label')

    expect($input?.hasAttribute('aria-label')).toBe(false)
    expect($wrapper?.hasAttribute('aria-label')).toBe(false)
  })

  it('updates aria-describedby dynamically', () => {
    const $pinInput = getPinInput()!
    const $input = getInput()

    $pinInput.setAttribute('aria-describedby', 'hint')

    expect($input?.getAttribute('aria-describedby')).toBe('hint')
  })
})
