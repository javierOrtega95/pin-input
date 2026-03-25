/** Context required to set up the click listener. */
interface ClickListenerContext {
  /** Returns the internal hidden input element. */
  getInput: () => HTMLInputElement | null
}

/** Context required to set up the double click listener. */
export interface DoubleClickListenerContext {
  /** Returns the current PIN value. */
  getCurrentValue: () => string
  /** Sets the selecting state. */
  setIsSelecting: (value: boolean) => void
  /** Returns the internal hidden input element. */
  getInput: () => HTMLInputElement | null
  /** Triggers a full DOM and state update. */
  update: () => void
}

/**
 * Sets up a click listener that focuses the internal input.
 * @param target - The element to attach the listener to.
 * @param context - The click listener context.
 * @param signal - AbortSignal to remove the listener when needed.
 */
export function setupClickListener(
  target: EventTarget,
  { getInput }: ClickListenerContext,
  signal: AbortSignal
): void {
  target.addEventListener('click', () => getInput()?.focus(), {
    signal,
  })
}

/**
 * Sets up a double click listener that selects all filled slots.
 * @param target - The element to attach the listener to.
 * @param context - The double click listener context.
 * @param signal - AbortSignal to remove the listener when needed.
 */
export function setupDoubleClickListener(
  target: EventTarget,
  {
    getCurrentValue,
    getInput,
    setIsSelecting,
    update,
  }: DoubleClickListenerContext,
  signal: AbortSignal
): void {
  // double click — select all filled slots
  target.addEventListener(
    'dblclick',
    () => {
      if (getCurrentValue().length === 0) return

      setIsSelecting(true)
      getInput()?.select()
      update()
    },
    { signal }
  )
}
