export function getPinInput(): Element | null {
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
