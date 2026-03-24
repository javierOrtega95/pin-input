import type { PinInputProps } from './types'

const DEFAULT_LENGTH = 6
const DEFAULT_PATTERN = '[0-9]'
const DEFAULT_AUTOCOMPLETE = 'one-time-code'

enum Key {
  Up = 'ArrowUp',
  Down = 'ArrowDown',
  Left = 'ArrowLeft',
  Right = 'ArrowRight',
  Backspace = 'Backspace',
  Delete = 'Delete',
  Home = 'Home',
  End = 'End',
  A = 'a',
}

const HORIZONTAL_ARROW_KEYS = [Key.Left, Key.Right]

const JUMP_TO_START_KEYS = [Key.Up, Key.Home]
const JUMP_TO_END_KEYS = [Key.Down, Key.End]

class PinInput extends HTMLElement implements PinInputProps {
  private currentValue: string = ''
  private lastEmittedValue: string = ''
  private isFocused: boolean = false
  private isSelecting: boolean = false
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
    'required',
    'aria-label',
    'aria-describedby',
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

  get required(): boolean {
    return this.hasAttribute('required')
  }

  get ariaLabel(): string | null {
    return this.getAttribute('aria-label')
  }

  get ariaDescribedBy(): string | null {
    return this.getAttribute('aria-describedby')
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

  private get $wrapper(): HTMLElement | null {
    return this.shadowRoot?.querySelector('[part="wrapper"]') ?? null
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
          isCursorInsideFilled && this.lastKey !== Key.Backspace

        if (this.isSelecting) {
          this.isSelecting = false

          const newChar = this.lastKey

          if (!newChar || !this.patternRegex.test(newChar)) {
            $target.value = this.currentValue

            return
          }

          $target.value = newChar
          $target.setSelectionRange(1, 1)

          this.currentValue = newChar
          this.updateSlots()

          return
        }

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

        if (event.key === Key.A && (event.ctrlKey || event.metaKey)) {
          event.preventDefault()

          if (this.currentValue.length === 0) return

          this.isSelecting = true
          this.$input?.select()
          this.updateSlots()

          return
        }

        // when input is complete and cursor is on a filled slot,
        // handle replacement directly to avoid maxlength issues
        const isComplete = this.currentValue.length === this.length

        const isAtFilledSlot =
          this.cursorPositionBeforeInput < this.currentValue.length

        if (
          isComplete &&
          isAtFilledSlot &&
          event.key.length === 1 &&
          !this.isSelecting
        ) {
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

        if (JUMP_TO_START_KEYS.includes(event.key as Key)) {
          event.preventDefault()
          this.isSelecting = false

          if (this.$input?.selectionStart === 0) return

          this.$input?.setSelectionRange(0, 0)
          requestAnimationFrame(() => this.updateSlots())

          return
        }

        if (JUMP_TO_END_KEYS.includes(event.key as Key)) {
          event.preventDefault()
          this.isSelecting = false

          const endPosition = Math.min(
            this.currentValue.length,
            this.length - 1
          )

          if (this.$input?.selectionStart === endPosition) return

          this.$input?.setSelectionRange(endPosition, endPosition)
          requestAnimationFrame(() => this.updateSlots())

          return
        }

        if (event.key === Key.Backspace) {
          event.preventDefault()

          if (this.isSelecting) {
            this.clearSelection()

            return
          }

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

        if (event.key === Key.Delete) {
          event.preventDefault()

          if (this.isSelecting) {
            this.clearSelection()

            return
          }

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
          event.key as Key
        )

        if (isHorizontalArrow) {
          if (this.isSelecting) {
            this.isSelecting = false

            if (event.key === Key.Right) {
              const endPosition = Math.min(
                this.currentValue.length,
                this.length - 1
              )

              this.$input?.setSelectionRange(endPosition, endPosition)
            } else {
              this.$input?.setSelectionRange(0, 0)
            }

            requestAnimationFrame(() => this.updateSlots())
            return
          }

          const rawCursor = this.$input?.selectionStart ?? 0
          const cursorPosition = Math.min(rawCursor, this.length - 1)

          // sync if cursor was out of bounds
          if (rawCursor > this.length - 1) {
            this.$input?.setSelectionRange(cursorPosition, cursorPosition)
          }

          // ctrl/meta + arrow — jump to start or end
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()

            if (event.key === Key.Left) {
              this.$input?.setSelectionRange(0, 0)
            } else {
              const endPosition = Math.min(
                this.currentValue.length,
                this.length - 1
              )
              this.$input?.setSelectionRange(endPosition, endPosition)
            }

            requestAnimationFrame(() => this.updateSlots())
            return
          }

          const isLeftMove = event.key === Key.Left
          const isRightMove = event.key === Key.Right

          const isAtStart = cursorPosition <= 0
          const isAtEnd =
            cursorPosition >=
            Math.min(this.currentValue.length, this.length - 1)

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

    // double click — select all filled slots
    this.addEventListener(
      'dblclick',
      () => {
        if (this.currentValue.length === 0) return
        this.isSelecting = true
        this.$input?.select()
        this.updateSlots()
      },
      { signal }
    )

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
        this.isSelecting = false
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

  private clearSelection(): void {
    this.isSelecting = false
    this.currentValue = ''

    if (this.$input) {
      this.$input.value = ''
      this.$input.setSelectionRange(0, 0)
    }

    this.updateSlots()
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
      this.disabled ? 'disabled aria-disabled="true"' : '',
      this.invalid ? 'aria-invalid="true"' : '',
      this.required ? 'required aria-required="true"' : '',
      this.ariaLabel ? `aria-label="${this.ariaLabel}"` : '',
      this.ariaDescribedBy ? `aria-describedby="${this.ariaDescribedBy}"` : '',
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

      const isSelected = this.isSelecting && isFilled

      const isError = this.invalid

      const cursorHtml =
        isActive && !currentChar ? `<span part="cursor"></span>` : ''

      slot.innerHTML = currentChar + cursorHtml

      slot.setAttribute(
        'part',
        [
          'slot',
          isActive && !this.isSelecting && 'active',
          isFilled && 'filled',
          isError && 'error',
          isSelected && 'selected',
        ]
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

    // sync aria attributes
    this.$input?.setAttribute('aria-invalid', String(this.invalid))
    this.$input?.setAttribute('aria-required', String(this.required))
    this.$input?.setAttribute('aria-disabled', String(this.disabled))

    if (this.ariaLabel) {
      this.$input?.setAttribute('aria-label', this.ariaLabel)
    } else {
      this.$input?.removeAttribute('aria-label')
    }

    if (this.ariaDescribedBy) {
      this.$input?.setAttribute('aria-describedby', this.ariaDescribedBy)
    } else {
      this.$input?.removeAttribute('aria-describedby')
    }

    if (this.ariaLabel) {
      this.$wrapper?.setAttribute('aria-label', this.ariaLabel)
    } else {
      this.$wrapper?.removeAttribute('aria-label')
    }

    // sync value with the form
    this.internals.setFormValue(this.currentValue)
  }

  private render(): void {
    if (!this.shadowRoot) return

    this.shadowRoot.innerHTML = `
    <style>
      @keyframes blink {
        50% { opacity: 0; }
      }

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

    <div part="wrapper" role="group" ${this.ariaLabel ? `aria-label="${this.ariaLabel}"` : ''}>
      ${this.buildSlots()}

      ${this.buildInput()}
    </div>
    `
  }
}

customElements.define('pin-input', PinInput)
