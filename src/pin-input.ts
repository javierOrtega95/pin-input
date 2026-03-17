import type { PinInputProps } from './types'

const DEFAULT_LENGTH = 6
const DEFAULT_PATTERN = '[0-9]'
const DEFAULT_AUTOCOMPLETE = 'one-time-code'

class PinInput extends HTMLElement implements PinInputProps {
  private currentValue: string = ''

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

  private get inputEl(): HTMLInputElement | null {
    return this.shadowRoot?.querySelector('input') ?? null
  }

  private get slotEls(): Array<HTMLElement> {
    if (!this.shadowRoot) return []

    const slots: NodeListOf<HTMLElement> =
      this.shadowRoot.querySelectorAll('[part~="slot"]')

    return Array.from(slots)
  }

  // Lifecycle
  connectedCallback(): void {
    this.currentValue = this.value

    this.render()
    this.updateSlots()

    this.inputEl?.addEventListener('input', (e) => {
      const input = e.target as HTMLInputElement
      this.currentValue = input.value

      this.updateSlots()
    })

    this.addEventListener('click', () => {
      this.inputEl?.focus()
    })
  }

  attributeChangedCallback(
    _name: keyof PinInputProps,
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (oldValue === newValue) return

    this.render()
  }

  private buildInput(): string {
    const attrs = [
      `type="text"`,
      `autocomplete="${this.autocomplete}"`,
      `maxlength="${this.length}"`,
      `value="${this.currentValue}"`,
      this.name ? `name="${this.name}"` : '',
      this.disabled ? 'disabled' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return `<input ${attrs} />`
  }

  private updateSlots(): void {
    this.slotEls.forEach((slot, index) => {
      const currentChar = this.currentValue[index] ?? ''

      const isActive = index === this.currentValue.length && !this.disabled
      const isFilled = index < this.currentValue.length

      slot.textContent = currentChar

      slot.setAttribute(
        'part',
        ['slot', isActive && 'active', isFilled && 'filled']
          .filter(Boolean)
          .join(' ')
      )
    })
  }

  // Render
  private render(): void {
    if (!this.shadowRoot) return

    this.shadowRoot.innerHTML = `
    <style>
      :host {
        display: inline-block;
      }

      :host([disabled]) {
        opacity: 0.5;
        pointer-events: none;
      }

      [part="wrapper"] {
        position: relative;
        display: flex;
        align-items: flex-start;
      }

      input {
        position: absolute;
        inset: 0;
        opacity: 0;
        width: 100%;
        height: 100%;
        cursor: text;
      }
    </style>

    <div part="wrapper">
      ${Array.from({ length: this.length })
        .map(() => `<div part="slot"></div>`)
        .join('')}

      ${this.buildInput()}
    </div>
    `
  }
}

customElements.define('pin-input', PinInput)
