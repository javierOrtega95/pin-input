/** Context required to update the slot parts. */
interface UpdateSlotsPartsContext {
  /** Returns the current PIN value. */
  getCurrentValue: () => string
  /** Returns the maximum number of slots. */
  getLength: () => number
  /** Returns whether the input is focused. */
  getIsFocused: () => boolean
  /** Returns whether the input is in selecting state. */
  getIsSelecting: () => boolean
  /** Returns whether the input is disabled. */
  getDisabled: () => boolean
  /** Returns whether the input is in an invalid state. */
  getInvalid: () => boolean
  /** Returns whether the input characters should be masked. */
  getMask: () => boolean
  /** Returns the internal hidden input element. */
  getInput: () => HTMLInputElement | null
  /** Returns the list of slot elements. */
  getSlots: () => HTMLElement[]
}

/**
 * Updates the part attributes and content of each slot element
 * based on the current value, cursor position and component state.
 * @param context - The update slots context.
 */
export function updateSlotsParts({
  getCurrentValue,
  getLength,
  getIsFocused,
  getIsSelecting,
  getDisabled,
  getInvalid,
  getMask,
  getInput,
  getSlots,
}: UpdateSlotsPartsContext): void {
  const currentValue = getCurrentValue()

  const cursorPosition = Math.min(
    getInput()?.selectionStart ?? currentValue.length,
    getLength() - 1
  )

  getSlots().forEach((slot, index) => {
    const currentChar = currentValue[index] ?? ''

    const isActive =
      index === cursorPosition && getIsFocused() && !getDisabled()

    const isFilled = index < currentValue.length

    const isMasked = isFilled && getMask()

    const isSelected = getIsSelecting() && isFilled

    const isError = getInvalid()

    const cursorHtml =
      isActive && !currentChar ? `<span part="cursor"></span>` : ''

    slot.innerHTML = (isMasked ? '•' : currentChar) + cursorHtml

    slot.setAttribute(
      'part',
      [
        'slot',
        isActive && !getIsSelecting() && 'active',
        isFilled && 'filled',
        isMasked && 'masked',
        isError && 'error',
        isSelected && 'selected',
      ]
        .filter(Boolean)
        .join(' ')
    )
  })
}
