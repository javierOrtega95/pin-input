/** Context required to build the slot elements HTML. */
interface BuildSlotsContext {
  /** Returns the maximum number of slots. */
  getLength: () => number
  /** Returns the positions after which a separator should be rendered. */
  getSeparatorPositions: () => number[]
}

/** Context required to build the hidden input element HTML. */
interface BuildInputContext {
  /** Returns the current PIN value. */
  getCurrentValue: () => string
  /** Returns the name attribute for form submission. */
  getName: () => string | undefined
  /** Returns the autocomplete attribute value. */
  getAutocomplete: () => string
  /** Returns whether the input is disabled. */
  getDisabled: () => boolean
  /** Returns whether the input is in an invalid state. */
  getInvalid: () => boolean
  /** Returns whether the input characters should be masked. */
  getMask: () => boolean
  /** Returns whether the input is required. */
  getRequired: () => boolean
  /** Returns the aria-label attribute value. */
  getAriaLabel: () => string | null
  /** Returns the aria-describedby attribute value. */
  getAriaDescribedBy: () => string | null
}

/** Context required to render the full component HTML into the shadow DOM. */
interface RenderContext extends BuildSlotsContext, BuildInputContext {
  /** Returns the aria-label attribute value. */
  getAriaLabel: () => string | null
  /** The shadow root to render into. */
  shadowRoot: ShadowRoot
}

/**
 * Builds the HTML string for all slot and separator elements.
 * @param context - The build slots context.
 */
export function buildSlots({
  getLength,
  getSeparatorPositions,
}: BuildSlotsContext): string {
  return Array.from({ length: getLength() })
    .map((_, index) => {
      const slot = `<div part="slot"></div>`
      const separator = getSeparatorPositions().includes(index + 1)
        ? `<span part="separator"></span>`
        : ''

      return slot + separator
    })
    .join('')
}

/**
 * Builds the HTML string for the hidden internal input element.
 * @param context - The build input context.
 */
export function buildInput({
  getCurrentValue,
  getName,
  getAutocomplete,
  getDisabled,
  getInvalid,
  getMask,
  getRequired,
  getAriaLabel,
  getAriaDescribedBy,
}: BuildInputContext): string {
  const attrs = [
    `type="${getMask() ? 'password' : 'text'}"`,
    `autocomplete="${getAutocomplete()}"`,
    `value="${getCurrentValue()}"`,
    getName() ? `name="${getName()}"` : '',
    getDisabled() ? 'disabled aria-disabled="true"' : '',
    getInvalid() ? 'aria-invalid="true"' : '',
    getRequired() ? 'required aria-required="true"' : '',
    getAriaLabel() ? `aria-label="${getAriaLabel()}"` : '',
    getAriaDescribedBy() ? `aria-describedby="${getAriaDescribedBy()}"` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return `<input ${attrs} />`
}

/**
 * Renders the full component HTML into the shadow DOM,
 * including styles, slots, separators and the hidden input.
 * @param context - The render context.
 */
export function renderHTML(context: RenderContext): void {
  const { shadowRoot, getAriaLabel } = context

  shadowRoot.innerHTML = `
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

  <div part="wrapper" role="group" ${getAriaLabel() ? `aria-label="${getAriaLabel()}"` : ''}>
    ${buildSlots(context)}
    ${buildInput(context)}
  </div>
  `
}
