interface SyncAriaAttributesContext {
  getInvalid: () => boolean
  getRequired: () => boolean
  getDisabled: () => boolean
  getAriaLabel: () => string | null
  getAriaDescribedBy: () => string | null
  getInput: () => HTMLInputElement | null
  getWrapper: () => HTMLElement | null
}

export function syncAriaAttributes({
  getInvalid,
  getRequired,
  getDisabled,
  getAriaLabel,
  getAriaDescribedBy,
  getInput,
  getWrapper,
}: SyncAriaAttributesContext): void {
  const $input = getInput()
  const $wrapper = getWrapper()
  const ariaLabel = getAriaLabel()
  const ariaDescribedBy = getAriaDescribedBy()

  $input?.setAttribute('aria-invalid', String(getInvalid()))
  $input?.setAttribute('aria-required', String(getRequired()))
  $input?.setAttribute('aria-disabled', String(getDisabled()))

  if (ariaLabel) {
    $input?.setAttribute('aria-label', ariaLabel)
    $wrapper?.setAttribute('aria-label', ariaLabel)
  } else {
    $input?.removeAttribute('aria-label')
    $wrapper?.removeAttribute('aria-label')
  }

  if (ariaDescribedBy) {
    $input?.setAttribute('aria-describedby', ariaDescribedBy)
  } else {
    $input?.removeAttribute('aria-describedby')
  }
}
