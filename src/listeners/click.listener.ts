interface ClickListenerContext {
  getInput: () => HTMLInputElement | null
}

interface DoubleClickListenerContext {
  getCurrentValue: () => string
  setIsSelecting: (value: boolean) => void
  getInput: () => HTMLInputElement | null
  update: VoidFunction
}

export function setupClickListener(
  target: EventTarget,
  { getInput }: ClickListenerContext,
  signal: AbortSignal
): void {
  target.addEventListener('click', () => getInput()?.focus(), {
    signal,
  })
}

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
