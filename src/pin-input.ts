import {
  DEFAULT_AUTOCOMPLETE,
  DEFAULT_LENGTH,
  DEFAULT_PATTERN,
} from './constants'
import {
  setupClickListener,
  setupDoubleClickListener,
} from './listeners/click.listener'
import {
  setupBlurListener,
  setupFocusListener,
} from './listeners/focus.listener'
import { setupInputListener } from './listeners/input.listener'
import { setupKeydownListener } from './listeners/keydown.listener'
import { setupPasteListener } from './listeners/paste.listener'
import { renderHTML } from './render'
import type { PinInputAttributes } from './types'
import { syncAriaAttributes } from './update/aria'
import { emitEvents } from './update/events'
import { syncFormState } from './update/form'
import { updateSlotsParts } from './update/slots'

/**
 * `<pin-input>` — A headless, accessible PIN/OTP input web component.
 *
 * @element pin-input
 *
 * @attr {number} length - Number of input slots. Defaults to 6.
 * @attr {string} value - Initial value of the input.
 * @attr {string} pattern - Regex pattern for valid characters. Defaults to `[0-9]`.
 * @attr {string} name - Name of the field for form submission.
 * @attr {string} autocomplete - Autocomplete attribute. Defaults to `one-time-code`.
 * @attr {boolean} disabled - Disables the input.
 * @attr {boolean} invalid - Marks the input as invalid.
 * @attr {boolean} required - Marks the input as required.
 * @attr {boolean} autofocus - Focuses the input on mount.
 * @attr {string} separators - Comma-separated slot positions after which a separator is rendered (e.g. `"3"` or `"2,4"`).
 * @attr {string} aria-label - Accessible label for the input group.
 * @attr {string} aria-describedby - ID of the element that describes the input.
 *
 * @fires {CustomEvent<{ value: string }>} pin-change - Fired when the value changes.
 * @fires {CustomEvent<{ value: string }>} pin-complete - Fired when all slots are filled.
 *
 * @csspart wrapper - The outer wrapper element with `role="group"`.
 * @csspart slot - Each individual character slot.
 * @csspart slot.active - The currently active slot.
 * @csspart slot.filled - A slot that contains a character.
 * @csspart slot.error - A slot in error state (when `invalid` is set).
 * @csspart slot.selected - A slot in selected state (when Ctrl+A or double click).
 * @csspart separator - A separator element between slots.
 * @csspart cursor - The cursor element inside the active empty slot.
 */
class PinInput extends HTMLElement implements PinInputAttributes {
  // ─── State ───────────────────────────────
  private currentValue: string = ''
  private lastEmittedValue: string = ''
  private lastKey: string = ''
  private isFocused: boolean = false
  private isSelecting: boolean = false
  private cursorPositionBeforeInput: number = 0
  private listenerController: AbortController = new AbortController()
  private internals: ElementInternals
  private patternRegex: RegExp = new RegExp(`^${DEFAULT_PATTERN}$`)

  // ─── Static ───────────────────────────────
  static formAssociated = true

  static observedAttributes: (keyof PinInputAttributes)[] = [
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

  constructor() {
    super()
    this.internals = this.attachInternals()
    this.attachShadow({ mode: 'open' })
  }

  // ─── Getters ───────────────────────────────

  /** Number of input slots. Defaults to 6. */
  get length(): number {
    return Number(this.getAttribute('length') ?? DEFAULT_LENGTH)
  }

  /** Current value of the input. */
  get value(): string {
    return this.getAttribute('value') ?? ''
  }

  /** Regex pattern for valid characters. Defaults to `[0-9]`. */
  get pattern(): string {
    return this.getAttribute('pattern') ?? DEFAULT_PATTERN
  }

  /** Name of the field for form submission. */
  get name(): string | undefined {
    return this.getAttribute('name') ?? undefined
  }

  /** Autocomplete attribute. Defaults to `one-time-code`. */
  get autocomplete(): string {
    return this.getAttribute('autocomplete') ?? DEFAULT_AUTOCOMPLETE
  }

  /** Whether the input is disabled. */
  get disabled(): boolean {
    return this.hasAttribute('disabled')
  }

  /** Whether the input is in an invalid state. */
  get invalid(): boolean {
    return this.hasAttribute('invalid')
  }

  /** Comma-separated slot positions after which a separator is rendered. */
  get separators(): string {
    return this.getAttribute('separators') ?? ''
  }

  /** Whether the input is required for form submission. */
  get required(): boolean {
    return this.hasAttribute('required')
  }

  /** Accessible label for the input group. */
  get ariaLabel(): string | null {
    return this.getAttribute('aria-label')
  }

  /** ID of the element that describes the input. */
  get ariaDescribedBy(): string | null {
    return this.getAttribute('aria-describedby')
  }

  // ─── Private Getters ───────────────────────────────
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

  // ─── Lifecycle ───────────────────────────────
  connectedCallback(): void {
    this.currentValue = this.value

    this.render()
    this.update()
    this.setupListeners()

    if (this.hasAttribute('autofocus')) {
      this.$input?.focus()
    }
  }

  disconnectedCallback(): void {
    this.listenerController.abort()
  }

  attributeChangedCallback(
    name: keyof PinInputAttributes,
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
      this.update()
      this.setupListeners()

      return
    }

    if (name === 'value') {
      this.currentValue = this.value

      if (this.$input) this.$input.value = this.currentValue

      this.update()

      return
    }

    // for all other attributes, just update slots — no re-render needed
    this.update()
  }

  // ─── Listeners ───────────────────────────────
  private setupListeners(): void {
    // remove previous listeners before adding new ones
    this.listenerController.abort()
    this.listenerController = new AbortController()

    const { signal } = this.listenerController

    setupClickListener(this, { getInput: () => this.$input }, signal)
    setupDoubleClickListener(
      this,
      {
        getCurrentValue: () => this.currentValue,
        setIsSelecting: (value: boolean) => {
          this.isSelecting = value
        },
        getInput: () => this.$input,
        update: () => this.update(),
      },
      signal
    )

    setupFocusListener(
      this.$input!,
      {
        getCurrentValue: () => this.currentValue,
        getLength: () => this.length,
        getInput: () => this.$input,
        setIsFocused: (value: boolean) => {
          this.isFocused = value
        },
        setIsSelecting: (value: boolean) => {
          this.isSelecting = value
        },
        update: () => this.update(),
      },
      signal
    )

    setupBlurListener(
      this.$input!,
      {
        setIsFocused: (value: boolean) => {
          this.isFocused = value
        },
        setIsSelecting: (value: boolean) => {
          this.isSelecting = value
        },
        update: () => this.update(),
      },
      signal
    )

    setupPasteListener(
      this.$input!,
      {
        getCurrentValue: () => this.currentValue,
        getLength: () => this.length,
        getInput: () => this.$input,
        getPatternRegex: () => this.patternRegex,
        setCurrentValue: (value) => {
          this.currentValue = value
        },
        update: () => this.update(),
      },
      signal
    )

    setupInputListener(
      this.$input!,
      {
        getCurrentValue: () => this.currentValue,
        getLength: () => this.length,
        getCursorPositionBeforeInput: () => this.cursorPositionBeforeInput,
        getLastKey: () => this.lastKey,
        getIsSelecting: () => this.isSelecting,
        getPatternRegex: () => this.patternRegex,
        setCurrentValue: (value: string) => {
          this.currentValue = value
        },
        setIsSelecting: (value: boolean) => {
          this.isSelecting = value
        },
        update: () => this.update(),
      },
      signal
    )

    setupKeydownListener(
      this.$input!,
      {
        getCurrentValue: () => this.currentValue,
        getLength: () => this.length,
        getIsSelecting: () => this.isSelecting,
        getInput: () => this.$input,
        getPatternRegex: () => this.patternRegex,
        setCurrentValue: (value) => {
          this.currentValue = value
        },
        setLastKey: (value) => {
          this.lastKey = value
        },
        setCursorPositionBeforeInput: (value) => {
          this.cursorPositionBeforeInput = value
        },
        setIsSelecting: (value) => {
          this.isSelecting = value
        },
        clearSelection: () => this.clearSelection(),
        update: () => this.update(),
      },
      signal
    )
  }

  private clearSelection(): void {
    this.isSelecting = false
    this.currentValue = ''

    if (this.$input) {
      this.$input.value = ''
      this.$input.setSelectionRange(0, 0)
    }

    this.update()
  }

  // ─── Update ───────────────────────────────
  private update(): void {
    updateSlotsParts({
      getCurrentValue: () => this.currentValue,
      getLength: () => this.length,
      getIsFocused: () => this.isFocused,
      getIsSelecting: () => this.isSelecting,
      getDisabled: () => this.disabled,
      getInvalid: () => this.invalid,
      getInput: () => this.$input,
      getSlots: () => this.$slots,
    })

    emitEvents({
      getCurrentValue: () => this.currentValue,
      getLastEmittedValue: () => this.lastEmittedValue,
      getLength: () => this.length,
      setLastEmittedValue: (value) => {
        this.lastEmittedValue = value
      },
      dispatchEvent: (event) => this.dispatchEvent(event),
    })

    syncAriaAttributes({
      getInvalid: () => this.invalid,
      getRequired: () => this.required,
      getDisabled: () => this.disabled,
      getAriaLabel: () => this.ariaLabel,
      getAriaDescribedBy: () => this.ariaDescribedBy,
      getInput: () => this.$input,
      getWrapper: () => this.$wrapper,
    })

    syncFormState({
      getCurrentValue: () => this.currentValue,
      getLength: () => this.length,
      getRequired: () => this.required,
      getInput: () => this.$input,
      internals: this.internals,
    })
  }

  // ─── Render ───────────────────────────────
  private render(): void {
    if (!this.shadowRoot) return

    renderHTML({
      shadowRoot: this.shadowRoot,
      getLength: () => this.length,
      getSeparatorPositions: () => this.separatorPositions,
      getCurrentValue: () => this.currentValue,
      getName: () => this.name,
      getAutocomplete: () => this.autocomplete,
      getDisabled: () => this.disabled,
      getInvalid: () => this.invalid,
      getRequired: () => this.required,
      getAriaLabel: () => this.ariaLabel,
      getAriaDescribedBy: () => this.ariaDescribedBy,
    })
  }
}

customElements.define('pin-input', PinInput)
