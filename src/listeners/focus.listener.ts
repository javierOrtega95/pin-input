interface FocusListenerContext {
  getCurrentValue: () => string
  getLength: () => number
  getInput: () => HTMLInputElement | null
  setIsFocused: (value: boolean) => void
  setIsSelecting: (value: boolean) => void
  update: VoidFunction
}

interface BlurListenerContext {
  setIsFocused: (value: boolean) => void
  setIsSelecting: (value: boolean) => void
  update: VoidFunction
}

export function setupFocusListener(
  target: EventTarget,
  {
    getCurrentValue,
    getLength,
    getInput,
    setIsFocused,
    update,
  }: FocusListenerContext,
  signal: AbortSignal
): void {
  target.addEventListener(
    'focus',
    () => {
      setIsFocused(true)

      // place cursor at end of current value on focus
      const cursorPos = Math.min(getCurrentValue().length, getLength() - 1)

      getInput()?.setSelectionRange(cursorPos, cursorPos)
      update()
    },
    { signal }
  )
}

export function setupBlurListener(
  target: EventTarget,
  { setIsFocused, setIsSelecting, update }: BlurListenerContext,
  signal: AbortSignal
): void {
  target.addEventListener(
    'blur',
    () => {
      setIsFocused(false)
      setIsSelecting(false)

      update()
    },
    { signal }
  )
}
