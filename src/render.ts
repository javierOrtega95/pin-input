export interface BuildSlotsContext {
  getLength: () => number
  getSeparatorPositions: () => number[]
}

export interface BuildInputContext {
  getCurrentValue: () => string
  getName: () => string | undefined
  getAutocomplete: () => string
  getDisabled: () => boolean
  getInvalid: () => boolean
  getRequired: () => boolean
  getAriaLabel: () => string | null
  getAriaDescribedBy: () => string | null
}

export interface RenderContext extends BuildSlotsContext, BuildInputContext {
  getAriaLabel: () => string | null
  shadowRoot: ShadowRoot
}

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

export function buildInput({
  getCurrentValue,
  getName,
  getAutocomplete,
  getDisabled,
  getInvalid,
  getRequired,
  getAriaLabel,
  getAriaDescribedBy,
}: BuildInputContext): string {
  const attrs = [
    `type="text"`,
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
