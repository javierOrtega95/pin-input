interface PasteListenerContext {
  getCurrentValue: () => string
  getLength: () => number
  getInput: () => HTMLInputElement | null
  getPatternRegex: () => RegExp
  setCurrentValue: (value: string) => void
  update: VoidFunction
}

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
