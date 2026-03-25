/** Context required to sync form state and validity. */
interface SyncFormStateContext {
  /** Returns the current PIN value. */
  getCurrentValue: () => string
  /** Returns the maximum number of slots. */
  getLength: () => number
  /** Returns whether the input is required. */
  getRequired: () => boolean
  /** Returns the internal hidden input element. */
  getInput: () => HTMLInputElement | null
  /** The ElementInternals instance for form participation. */
  internals: ElementInternals
}

/**
 * Syncs the form value and validity state using ElementInternals.
 * Sets `valueMissing` validity flag when the input is required and incomplete.
 * @param context - The sync form state context.
 */
export function syncFormState({
  getCurrentValue,
  getLength,
  getRequired,
  getInput,
  internals,
}: SyncFormStateContext): void {
  // sync value with the form
  internals.setFormValue(getCurrentValue())

  // sync form validity
  if (getRequired() && getCurrentValue().length < getLength()) {
    internals.setValidity(
      { valueMissing: true },
      'Value is required',
      getInput() ?? undefined
    )
  } else {
    internals.setValidity({})
  }
}
