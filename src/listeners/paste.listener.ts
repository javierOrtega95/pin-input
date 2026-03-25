/** Context required to set up the paste listener. */
export interface PasteListenerContext {
  /** Returns the current PIN value. */
  getCurrentValue: () => string
  /** Returns the maximum number of slots. */
  getLength: () => number
  /** Returns the internal hidden input element. */
  getInput: () => HTMLInputElement | null
  /** Returns the compiled regex pattern for valid characters. */
  getPatternRegex: () => RegExp
  /** Sets the current PIN value. */
  setCurrentValue: (value: string) => void
  /** Triggers a full DOM and state update. */
  update: VoidFunction
}

/**
 * Sets up a paste listener that validates and distributes pasted text across slots.
 * @param target - The element to attach the listener to.
 * @param context - The paste listener context.
 * @param signal - AbortSignal to remove the listener when needed.
 */
export function setupPasteListener(
  target: EventTarget,
  {
    getCurrentValue,
    getLength,
    getInput,
    getPatternRegex,
    setCurrentValue,
    update,
  }: PasteListenerContext,
  signal: AbortSignal
): void {
  target.addEventListener(
    'paste',
    (event) => {
      const pasteEvent = event as ClipboardEvent
      pasteEvent.preventDefault()

      const cursorPosition =
        getInput()?.selectionStart ?? getCurrentValue().length

      const pastedText = pasteEvent.clipboardData?.getData('text') ?? ''

      const validPasted = pastedText
        .split('')
        .filter((char) => getPatternRegex().test(char))
        .join('')

      if (!validPasted) return

      const currentPin = getCurrentValue().slice(0, cursorPosition)
      const newValue = (currentPin + validPasted).slice(0, getLength())

      setCurrentValue(newValue)

      const $input = getInput()

      if ($input) {
        $input.value = newValue
        $input.setSelectionRange(newValue.length, newValue.length)
      }

      update()
    },
    { signal }
  )
}
