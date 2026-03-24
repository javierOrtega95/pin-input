import { Key } from '../constants'

interface InputListenerContext {
  getCurrentValue: () => string
  getLength: () => number
  getCursorPositionBeforeInput: () => number
  getLastKey: () => string
  getIsSelecting: () => boolean
  getPatternRegex: () => RegExp
  setCurrentValue: (value: string) => void
  setIsSelecting: (value: boolean) => void
  update: VoidFunction
}

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
