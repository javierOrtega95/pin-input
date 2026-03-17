import type { PinInputProps } from './types'

const DEFAULT_LENGTH = 6
const DEFAULT_PATTERN = '[0-9]'
const DEFAULT_AUTOCOMPLETE = 'one-time-code'

const ARROW_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']

class PinInput extends HTMLElement implements PinInputProps {
  private currentValue: string = ''
  private isFocused: boolean = false

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

  private patternRegex: RegExp = new RegExp(`^${DEFAULT_PATTERN}$`)

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

  private get $input(): HTMLInputElement | null {
    return this.shadowRoot?.querySelector('input') ?? null
  }

  private get $slots(): Array<HTMLElement> {
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

    this.$input?.addEventListener('input', (event) => {
      const $target = event.target as HTMLInputElement

      const validatedValue = $target.value
        .split('')
        .filter((char) => this.patternRegex.test(char))
        .join('')

      if (validatedValue !== $target.value) {
        $target.value = validatedValue
      }

      // force cursor to the end
      $target.setSelectionRange($target.value.length, $target.value.length)

      this.currentValue = $target.value

      this.updateSlots()
    })

    this.$input?.addEventListener('keydown', (event) => {
      const isArrow = ARROW_KEYS.includes(event.key)

      if (isArrow) event.preventDefault()
    })

    this.addEventListener('click', () => this.$input?.focus())

    this.$input?.addEventListener('focus', () => {
      this.isFocused = true
      this.updateSlots()
    })

    this.$input?.addEventListener('blur', () => {
      this.isFocused = false
      this.updateSlots()
    })

    this.$input?.addEventListener('paste', (event) => {
      event.preventDefault()

      const cursorPosition =
        this.$input?.selectionStart ?? this.currentValue.length

      const pastedText = event.clipboardData?.getData('text') ?? ''

      const validPasted = pastedText
        .split('')
        .filter((char) => this.patternRegex.test(char))
        .join('')

      if (!validPasted) return

      const currentPin = this.currentValue.slice(0, cursorPosition)

      const newValue = (currentPin + validPasted).slice(0, this.length)

      this.currentValue = newValue

      if (this.$input) {
        this.$input.value = newValue
        this.$input.setSelectionRange(newValue.length, newValue.length)
      }

      this.updateSlots()
    })
  }

  attributeChangedCallback(
    name: keyof PinInputProps,
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (oldValue === newValue) return

    if (name === 'pattern') {
      this.patternRegex = new RegExp(`^${this.pattern}$`)
    }

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
    this.$slots.forEach((slot, index) => {
      const currentChar = this.currentValue[index] ?? ''

      const isActive =
        index === this.currentValue.length && !this.disabled && this.isFocused

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
