/** Context required to set up the focus listener. */
interface FocusListenerContext {
  /** Returns the current PIN value. */
  getCurrentValue: () => string
  /** Returns the maximum number of slots. */
  getLength: () => number
  /** Returns the internal hidden input element. */
  getInput: () => HTMLInputElement | null
  /** Sets the focused state. */
  setIsFocused: (value: boolean) => void
  /** Sets the selecting state. */
  setIsSelecting: (value: boolean) => void
  /** Triggers a full DOM and state update. */
  update: VoidFunction
}

/** Context required to set up the blur listener. */
interface BlurListenerContext {
  /** Sets the focused state. */
  setIsFocused: (value: boolean) => void
  /** Sets the selecting state. */
  setIsSelecting: (value: boolean) => void
  /** Triggers a full DOM and state update. */
  update: VoidFunction
}

/**
 * Sets up a focus listener that places the cursor at the end of the current value.
 * @param target - The element to attach the listener to.
 * @param context - The focus listener context.
 * @param signal - AbortSignal to remove the listener when needed.
 */
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
      update()

      // defer so our position wins over the browser's default tab-focus selection
      requestAnimationFrame(() => {
        const cursorPos = Math.min(getCurrentValue().length, getLength() - 1)
        getInput()?.setSelectionRange(cursorPos, cursorPos)
        update()
      })
    },
    { signal }
  )
}

/**
 * Sets up a blur listener that resets focus and selection state.
 * @param target - The element to attach the listener to.
 * @param context - The blur listener context.
 * @param signal - AbortSignal to remove the listener when needed.
 */
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
