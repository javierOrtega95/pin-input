import type { PinInputAttributes } from '../src/types'

export function getPinInput(): (HTMLElement & PinInputAttributes) | null {
  return document.querySelector('pin-input')
}

export function getShadowRoot(): ShadowRoot | null {
  return getPinInput()?.shadowRoot ?? null
}

export function getSlots(): Element[] {
  return Array.from(getShadowRoot()?.querySelectorAll('[part~="slot"]') ?? [])
}

export function getInput(): HTMLInputElement | null {
  return getShadowRoot()?.querySelector('input') ?? null
}

export function getWrapper(): Element | null {
  return getShadowRoot()?.querySelector('[part="wrapper"]') ?? null
}

export function simulatePaste(element: Element, text: string): void {
  const clipboardData = new DataTransfer()
  clipboardData.setData('text/plain', text)

  element.dispatchEvent(
    new ClipboardEvent('paste', {
      bubbles: true,
      clipboardData,
    })
  )
}
