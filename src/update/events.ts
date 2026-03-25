/** Context required to emit pin-change and pin-complete events. */
interface EmitEventsContext {
  /** Returns the current PIN value. */
  getCurrentValue: () => string
  /** Returns the last emitted value. */
  getLastEmittedValue: () => string
  /** Returns the maximum number of slots. */
  getLength: () => number
  /** Sets the last emitted value. */
  setLastEmittedValue: (value: string) => void
  /** Dispatches a custom event on the component. */
  dispatchEvent: (event: CustomEvent) => void
}

/**
 * Emits `pin-change` whenever the value changes, and `pin-complete`
 * when all slots are filled. Avoids duplicate emissions.
 * @param context - The emit events context.
 */
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
