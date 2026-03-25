/** Context required to sync ARIA attributes on the input and wrapper. */
interface SyncAriaAttributesContext {
  /** Returns whether the input is in an invalid state. */
  getInvalid: () => boolean
  /** Returns whether the input is required. */
  getRequired: () => boolean
  /** Returns whether the input is disabled. */
  getDisabled: () => boolean
  /** Returns the aria-label attribute value. */
  getAriaLabel: () => string | null
  /** Returns the aria-describedby attribute value. */
  getAriaDescribedBy: () => string | null
  /** Returns the internal hidden input element. */
  getInput: () => HTMLInputElement | null
  /** Returns the wrapper element. */
  getWrapper: () => HTMLElement | null
}

/**
 * Syncs aria-invalid, aria-required, aria-disabled, aria-label
 * and aria-describedby attributes on the internal input and wrapper.
 * @param context - The sync aria attributes context.
 */
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
