export interface UpdateSlotsPartsContext {
  getCurrentValue: () => string
  getLength: () => number
  getIsFocused: () => boolean
  getIsSelecting: () => boolean
  getDisabled: () => boolean
  getInvalid: () => boolean
  getInput: () => HTMLInputElement | null
  getSlots: () => HTMLElement[]
}

export function updateSlotsParts({
  getCurrentValue,
  getLength,
  getIsFocused,
  getIsSelecting,
  getDisabled,
  getInvalid,
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

    const isSelected = getIsSelecting() && isFilled

    const isError = getInvalid()

    const cursorHtml =
      isActive && !currentChar ? `<span part="cursor"></span>` : ''

    slot.innerHTML = currentChar + cursorHtml

    slot.setAttribute(
      'part',
      [
        'slot',
        isActive && !getIsSelecting() && 'active',
        isFilled && 'filled',
        isError && 'error',
        isSelected && 'selected',
      ]
        .filter(Boolean)
        .join(' ')
    )
  })
}
