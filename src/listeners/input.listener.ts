import { Key } from '../constants'

/** Context required to set up the input listener. */
export interface InputListenerContext {
  /** Returns the current PIN value. */
  getCurrentValue: () => string
  /** Returns the maximum number of slots. */
  getLength: () => number
  /** Returns the cursor position before the input event fired. */
  getCursorPositionBeforeInput: () => number
  /** Returns the last key pressed before the input event fired. */
  getLastKey: () => string
  /** Returns whether the input is in selecting state. */
  getIsSelecting: () => boolean
  /** Returns the compiled regex pattern for valid characters. */
  getPatternRegex: () => RegExp
  /** Sets the current PIN value. */
  setCurrentValue: (value: string) => void
  /** Sets the selecting state. */
  setIsSelecting: (value: boolean) => void
  /** Triggers a full DOM and state update. */
  update: VoidFunction
}

/**
 * Sets up an input listener that handles character input, replacement and validation.
 * @param target - The element to attach the listener to.
 * @param context - The input listener context.
 * @param signal - AbortSignal to remove the listener when needed.
 */
export function setupInputListener(
  target: EventTarget,
  {
    getCurrentValue,
    getLength,
    getCursorPositionBeforeInput,
    getLastKey,
    getIsSelecting,
    getPatternRegex,
    setCurrentValue,
    setIsSelecting,
    update,
  }: InputListenerContext,
  signal: AbortSignal
): void {
  target.addEventListener(
    'input',
    (event) => {
      const $target = event.target as HTMLInputElement

      // if cursor was inside the filled slots, we're replacing a character
      // not appending — unless the last key was Backspace
      const isCursorInsideFilled =
        getCursorPositionBeforeInput() < getCurrentValue().length

      const isReplacing = isCursorInsideFilled && getLastKey() !== Key.Backspace

      if (getIsSelecting()) {
        setIsSelecting(false)

        const newChar = getLastKey()

        if (!newChar || !getPatternRegex().test(newChar)) {
          $target.value = getCurrentValue()
          return
        }

        $target.value = newChar
        $target.setSelectionRange(1, 1)

        setCurrentValue(newChar)
        update()

        return
      }

      if (isReplacing) {
        // extract the newly typed character at the cursor position
        const newChar = $target.value[getCursorPositionBeforeInput()]

        // if invalid or no char, restore previous value and bail
        if (!newChar || !getPatternRegex().test(newChar)) {
          $target.value = getCurrentValue()
          return
        }

        // replace the character at cursor position, keep the rest
        const newValue =
          getCurrentValue().slice(0, getCursorPositionBeforeInput()) +
          newChar +
          getCurrentValue().slice(getCursorPositionBeforeInput() + 1)

        $target.value = newValue
        $target.setSelectionRange(
          getCursorPositionBeforeInput() + 1,
          getCursorPositionBeforeInput() + 1
        )

        setCurrentValue(newValue)
        update()

        return
      }

      // normal append — filter out characters that don't match the pattern
      const validatedValue = $target.value
        .split('')
        .filter((char) => getPatternRegex().test(char))
        .join('')
        .slice(0, getLength())

      if (validatedValue !== $target.value) {
        $target.value = validatedValue
      }

      // force cursor to the end
      const endPos = Math.min($target.value.length, getLength() - 1)
      $target.setSelectionRange(endPos, endPos)

      setCurrentValue($target.value)
      update()
    },
    { signal }
  )
}
