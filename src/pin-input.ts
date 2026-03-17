import type { PinInputProps } from './types'

const DEFAULT_LENGTH = 6
const DEFAULT_PATTERN = '[0-9]'
const DEFAULT_AUTOCOMPLETE = 'one-time-code'

class PinInput extends HTMLElement implements PinInputProps {
  static formAssociated = true

  static observedAttributes: (keyof PinInputProps)[] = [
    'length',
    'value',
    'pattern',
    'name',
    'autocomplete',
    'disabled',
    'invalid',
  ]

  private internals: ElementInternals

  constructor() {
    super()
    this.internals = this.attachInternals()
    this.attachShadow({ mode: 'open' })
  }

  // Getters
  get length(): number {
    return Number(this.getAttribute('length') ?? DEFAULT_LENGTH)
  }

  get value(): string {
    return this.getAttribute('value') ?? ''
  }

  get pattern(): string {
    return this.getAttribute('pattern') ?? DEFAULT_PATTERN
  }

  get name(): string | undefined {
    return this.getAttribute('name') ?? undefined
  }

  get autocomplete(): string {
    return this.getAttribute('autocomplete') ?? DEFAULT_AUTOCOMPLETE
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled')
  }

  get invalid(): boolean {
    return this.hasAttribute('invalid')
  }

  // Lifecycle
  connectedCallback(): void {
    this.render()
  }

  attributeChangedCallback(
    _name: keyof PinInputProps,
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (oldValue === newValue) return

    this.render()
  }

  // Render
  private render(): void {
    if (!this.shadowRoot) return

    this.shadowRoot.innerHTML = `
      <div part="wrapper">
        ${Array.from({ length: this.length })
          .map(() => `<div part="slot"></div>`)
          .join('')}
        <input type="text" />
      </div>
    `
  }
}

customElements.define('pin-input', PinInput)
