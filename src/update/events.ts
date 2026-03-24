interface EmitEventsContext {
  getCurrentValue: () => string
  getLastEmittedValue: () => string
  getLength: () => number
  setLastEmittedValue: (value: string) => void
  dispatchEvent: (event: CustomEvent) => void
}

export function emitEvents({
  getCurrentValue,
  getLastEmittedValue,
  getLength,
  setLastEmittedValue,
  dispatchEvent,
}: EmitEventsContext): void {
  const currentValue = getCurrentValue()
  const isComplete = currentValue.length === getLength()

  // emit change event if value has changed since last emission
  if (currentValue !== getLastEmittedValue()) {
    setLastEmittedValue(currentValue)

    dispatchEvent(
      new CustomEvent('pin-change', {
        detail: { value: currentValue },
        bubbles: true,
      })
    )

    if (isComplete) {
      dispatchEvent(
        new CustomEvent('pin-complete', {
          detail: { value: currentValue },
          bubbles: true,
        })
      )
    }
  }
}
