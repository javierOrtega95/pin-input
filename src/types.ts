/**
 * Attributes supported by the `<pin-input>` web component.
 * Used to type `observedAttributes` and `attributeChangedCallback`.
 */
export interface PinInputAttributes {
  /** Number of input slots. Defaults to 6. */
  length?: number
  /** Initial value of the input. */
  value?: string
  /** Regex pattern for valid characters. Defaults to `[0-9]`. */
  pattern?: string
  /** Name of the field for form submission. */
  name?: string
  /** Autocomplete attribute. Defaults to `one-time-code`. */
  autocomplete?: string
  /** Whether the input is disabled. */
  disabled?: boolean
  /** Whether the input is in an invalid state. */
  invalid?: boolean
  /** Focuses the input on mount. */
  autofocus?: boolean
  /** Comma-separated slot positions after which a separator is rendered. */
  separators?: string
  /** Whether the input is required for form submission. */
  required?: boolean
  /** Accessible label for the input group. */
  'aria-label'?: string
  /** ID of the element that describes the input. */
  'aria-describedby'?: string
}
