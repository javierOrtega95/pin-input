interface SyncFormStateContext {
  getCurrentValue: () => string
  getLength: () => number
  getRequired: () => boolean
  getInput: () => HTMLInputElement | null
  internals: ElementInternals
}

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
