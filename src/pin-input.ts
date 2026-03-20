import type { PinInputProps } from './types'

const DEFAULT_LENGTH = 6
const DEFAULT_PATTERN = '[0-9]'
const DEFAULT_AUTOCOMPLETE = 'one-time-code'

enum NavigationKey {
  Up = 'ArrowUp',
  Down = 'ArrowDown',
  Left = 'ArrowLeft',
  Right = 'ArrowRight',
  Backspace = 'Backspace',
  Delete = 'Delete',
  Home = 'Home',
  End = 'End',
}

const HORIZONTAL_ARROW_KEYS = [NavigationKey.Left, NavigationKey.Right]

const JUMP_TO_START_KEYS = [NavigationKey.Up, NavigationKey.Home]
const JUMP_TO_END_KEYS = [NavigationKey.Down, NavigationKey.End]

class PinInput extends HTMLElement implements PinInputProps {
  private currentValue: string = ''
  private lastEmittedValue: string = ''
  private isFocused: boolean = false
  private cursorPositionBeforeInput: number = 0
  private lastKey: string = ''
  private listenerController: AbortController = new AbortController()

  static formAssociated = true

  static observedAttributes: (keyof PinInputProps)[] = [
    'length',
    'value',
    'pattern',
    'name',
    'autocomplete',
    'disabled',
    'invalid',
    'autofocus',
    'separators',
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

  get separators(): string {
    return this.getAttribute('separators') ?? ''
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

  private get separatorPositions(): number[] {
    if (!this.separators) return []

    return this.separators.split(',').map(Number)
  }

  // Lifecycle
  connectedCallback(): void {
    this.currentValue = this.value

    this.render()
    this.updateSlots()
    this.setupListeners()

    if (this.hasAttribute('autofocus')) {
      this.$input?.focus()
    }
  }

  disconnectedCallback(): void {
    this.listenerController.abort()
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

    if (name === 'length' || name === 'separators') {
      this.currentValue = ''

      this.render()
      this.updateSlots()
      this.setupListeners()

      return
    }

    if (name === 'value') {
      this.currentValue = this.value
      if (this.$input) this.$input.value = this.currentValue
      this.updateSlots()
      return
    }

    // for all other attributes, just update slots — no re-render needed
    this.updateSlots()
  }

  private setupListeners(): void {
    // remove previous listeners before adding new ones
    this.listenerController.abort()
    this.listenerController = new AbortController()
    const { signal } = this.listenerController

    this.$input?.addEventListener(
      'input',
      (event) => {
        const $target = event.target as HTMLInputElement

        // if cursor was inside the filled slots, we're replacing a character
        // not appending — unless the last key was Backspace

        const isCursorInsideFilled =
          this.cursorPositionBeforeInput < this.currentValue.length

        const isReplacing =
          isCursorInsideFilled && this.lastKey !== NavigationKey.Backspace

        if (isReplacing) {
          // extract the newly typed character at the cursor position
          const newChar = $target.value[this.cursorPositionBeforeInput]

          // if invalid or no char, restore previous value and bail
          if (!newChar || !this.patternRegex.test(newChar)) {
            $target.value = this.currentValue

            return
          }

          // replace the character at cursor position, keep the rest
          const newValue =
            this.currentValue.slice(0, this.cursorPositionBeforeInput) +
            newChar +
            this.currentValue.slice(this.cursorPositionBeforeInput + 1)

          $target.value = newValue
          $target.setSelectionRange(
            this.cursorPositionBeforeInput + 1,
            this.cursorPositionBeforeInput + 1
          )

          this.currentValue = newValue
          this.updateSlots()

          return
        }

        // normal append — filter out characters that don't match the pattern

        const validatedValue = $target.value
          .split('')
          .filter((char) => this.patternRegex.test(char))
          .join('')
          .slice(0, this.length)

        if (validatedValue !== $target.value) {
          $target.value = validatedValue
        }

        // force cursor to the end
        const endPos = Math.min($target.value.length, this.length - 1)
        $target.setSelectionRange(endPos, endPos)

        this.currentValue = $target.value

        this.updateSlots()
      },
      { signal }
    )

    this.$input?.addEventListener(
      'keydown',
      (event) => {
        // track last key and cursor position before any input event fires
        this.lastKey = event.key
        this.cursorPositionBeforeInput = this.$input?.selectionStart ?? 0

        // when input is complete and cursor is on a filled slot,
        // handle replacement directly to avoid maxlength issues
        const isComplete = this.currentValue.length === this.length
        const isAtFilledSlot =
          this.cursorPositionBeforeInput < this.currentValue.length

        if (isComplete && isAtFilledSlot && event.key.length === 1) {
          event.preventDefault()

          if (!this.patternRegex.test(event.key)) return

          const currentPosition = this.cursorPositionBeforeInput
          const newValue =
            this.currentValue.slice(0, currentPosition) +
            event.key +
            this.currentValue.slice(currentPosition + 1)

          const nextPos = Math.min(currentPosition + 1, this.length - 1)

          this.currentValue = newValue

          if (this.$input) {
            this.$input.value = newValue
            this.$input.setSelectionRange(nextPos, nextPos)
          }

          this.updateSlots()

          return
        }

        if (JUMP_TO_START_KEYS.includes(event.key as NavigationKey)) {
          event.preventDefault()

          if (this.$input?.selectionStart === 0) return

          this.$input?.setSelectionRange(0, 0)
          requestAnimationFrame(() => this.updateSlots())

          return
        }

        if (JUMP_TO_END_KEYS.includes(event.key as NavigationKey)) {
          event.preventDefault()

          const endPosition = Math.min(
            this.currentValue.length,
            this.length - 1
          )

          if (this.$input?.selectionStart === endPosition) return

          this.$input?.setSelectionRange(endPosition, endPosition)
          requestAnimationFrame(() => this.updateSlots())

          return
        }

        if (event.key === NavigationKey.Backspace) {
          event.preventDefault()

          const cursorPosition = this.$input?.selectionStart ?? 0

          if (this.currentValue.length === 0) return

          // if current slot is empty, delete the previous character and move back
          // otherwise delete the character at the current position

          const isCursorAtEnd = cursorPosition >= this.currentValue.length

          const currentSlotIsEmpty =
            isCursorAtEnd || !this.currentValue[cursorPosition]

          const startSlice = currentSlotIsEmpty
            ? this.currentValue.slice(0, cursorPosition - 1)
            : this.currentValue.slice(0, cursorPosition)

          const endSlice = currentSlotIsEmpty
            ? this.currentValue.slice(cursorPosition)
            : this.currentValue.slice(cursorPosition + 1)

          const newValue = startSlice + endSlice

          const newPos = currentSlotIsEmpty
            ? cursorPosition - 1
            : cursorPosition

          this.currentValue = newValue

          if (this.$input) {
            this.$input.value = newValue
            this.$input.setSelectionRange(newPos, newPos)
          }

          this.updateSlots()

          return
        }

        if (event.key === NavigationKey.Delete) {
          event.preventDefault()

          const cursorPosition = this.$input?.selectionStart ?? 0

          // nothing to delete if cursor is past the last filled slot
          if (cursorPosition >= this.currentValue.length) return

          // delete the character at the current position, cursor stays
          const startSlice = this.currentValue.slice(0, cursorPosition)
          const endSlice = this.currentValue.slice(cursorPosition + 1)

          const newValue = startSlice + endSlice

          this.currentValue = newValue

          if (this.$input) {
            this.$input.value = newValue
            this.$input.setSelectionRange(cursorPosition, cursorPosition)
          }

          this.updateSlots()

          return
        }

        const isHorizontalArrow = HORIZONTAL_ARROW_KEYS.includes(
          event.key as NavigationKey
        )

        if (isHorizontalArrow) {
          const cursorPosition = this.$input?.selectionStart ?? 0

          const isLeftMove = event.key === NavigationKey.Left
          const isRightMove = event.key === NavigationKey.Right

          const isAtStart = cursorPosition <= 0
          const isAtEnd = cursorPosition >= this.currentValue.length

          if ((isLeftMove && isAtStart) || (isRightMove && isAtEnd)) {
            event.preventDefault()

            return
          }

          // defer update to next frame so cursor has already moved
          requestAnimationFrame(() => this.updateSlots())
        }
      },
      { signal }
    )

    this.addEventListener('click', () => this.$input?.focus(), { signal })

    this.$input?.addEventListener(
      'focus',
      () => {
        this.isFocused = true

        // place cursor at end of current value on focus
        const cursorPos = Math.min(this.currentValue.length, this.length - 1)

        this.$input?.setSelectionRange(cursorPos, cursorPos)
        this.updateSlots()
      },
      { signal }
    )

    this.$input?.addEventListener(
      'blur',
      () => {
        this.isFocused = false
        this.updateSlots()
      },
      { signal }
    )

    this.$input?.addEventListener(
      'paste',
      (event) => {
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
      },
      { signal }
    )
  }

  private buildSlots(): string {
    return Array.from({ length: this.length })
      .map((_, index) => {
        const slot = `<div part="slot"></div>`
        const separator = this.separatorPositions.includes(index + 1)
          ? `<span part="separator"></span>`
          : ''

        return slot + separator
      })
      .join('')
  }

  private buildInput(): string {
    const attrs = [
      `type="text"`,
      `autocomplete="${this.autocomplete}"`,
      `value="${this.currentValue}"`,
      this.name ? `name="${this.name}"` : '',
      this.disabled ? 'disabled' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return `<input ${attrs} />`
  }

  private updateSlots(): void {
    const cursorPosition = Math.min(
      this.$input?.selectionStart ?? this.currentValue.length,
      this.length - 1
    )

    this.$slots.forEach((slot, index) => {
      const currentChar = this.currentValue[index] ?? ''

      const isActive =
        index === cursorPosition && this.isFocused && !this.disabled

      const isFilled = index < this.currentValue.length

      const isError = this.invalid

      slot.textContent = currentChar

      slot.setAttribute(
        'part',
        ['slot', isActive && 'active', isFilled && 'filled', isError && 'error']
          .filter(Boolean)
          .join(' ')
      )
    })

    const isComplete = this.currentValue.length === this.length

    // emit change event if value has changed since last emission
    if (this.currentValue !== this.lastEmittedValue) {
      this.lastEmittedValue = this.currentValue

      this.dispatchEvent(
        new CustomEvent('pin-change', {
          detail: { value: this.currentValue },
          bubbles: true,
        })
      )

      if (isComplete) {
        this.dispatchEvent(
          new CustomEvent('pin-complete', {
            detail: { value: this.currentValue },
            bubbles: true,
          })
        )
      }
    }

    // sync value with the form
    this.internals.setFormValue(this.currentValue)
  }

  private render(): void {
    if (!this.shadowRoot) return

    this.shadowRoot.innerHTML = `
    <style>
      :host {
        display: inline-block;
      }

      :host([disabled]) {
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
      ${this.buildSlots()}

      ${this.buildInput()}
    </div>
    `
  }
}

customElements.define('pin-input', PinInput)
