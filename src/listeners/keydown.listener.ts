import {
  HORIZONTAL_ARROW_KEYS,
  JUMP_TO_END_KEYS,
  JUMP_TO_START_KEYS,
  Key,
} from '../constants'

/** Context required to set up the keydown listener. */
interface KeydownListenerContext {
  /** Returns the current PIN value. */
  getCurrentValue: () => string
  /** Returns the maximum number of slots. */
  getLength: () => number
  /** Returns whether the input is in selecting state. */
  getIsSelecting: () => boolean
  /** Returns the internal hidden input element. */
  getInput: () => HTMLInputElement | null
  /** Returns the compiled regex pattern for valid characters. */
  getPatternRegex: () => RegExp
  /** Sets the current PIN value. */
  setCurrentValue: (value: string) => void
  /** Sets the last key pressed. */
  setLastKey: (value: string) => void
  /** Sets the cursor position before the input event fires. */
  setCursorPositionBeforeInput: (value: number) => void
  /** Sets the selecting state. */
  setIsSelecting: (value: boolean) => void
  /** Clears the current selection and resets the value. */
  clearSelection: () => void
  /** Triggers a full DOM and state update. */
  update: VoidFunction
}

/**
 * Sets up a keydown listener that handles navigation, deletion and selection.
 * @param target - The element to attach the listener to.
 * @param context - The keydown listener context.
 * @param signal - AbortSignal to remove the listener when needed.
 */
export function setupKeydownListener(
  target: EventTarget,
  {
    getCurrentValue,
    getLength,
    getIsSelecting,
    getInput,
    getPatternRegex,
    setCurrentValue,
    setLastKey,
    setCursorPositionBeforeInput,
    setIsSelecting,
    clearSelection,
    update,
  }: KeydownListenerContext,
  signal: AbortSignal
): void {
  target.addEventListener(
    'keydown',
    (event) => {
      const keyEvent = event as KeyboardEvent

      // track last key and cursor position before any input event fires
      setLastKey(keyEvent.key)
      setCursorPositionBeforeInput(getInput()?.selectionStart ?? 0)

      if (keyEvent.key === Key.A && (keyEvent.ctrlKey || keyEvent.metaKey)) {
        keyEvent.preventDefault()

        if (getCurrentValue().length === 0) return

        setIsSelecting(true)

        getInput()?.select()

        update()

        return
      }

      // when input is complete and cursor is on a filled slot,
      // handle replacement directly to avoid maxlength issues
      const isComplete = getCurrentValue().length === getLength()
      const isAtFilledSlot =
        (getInput()?.selectionStart ?? 0) < getCurrentValue().length

      if (
        isComplete &&
        isAtFilledSlot &&
        keyEvent.key.length === 1 &&
        !getIsSelecting()
      ) {
        keyEvent.preventDefault()

        if (!getPatternRegex().test(keyEvent.key)) return

        const currentPosition = getInput()?.selectionStart ?? 0

        const newValue =
          getCurrentValue().slice(0, currentPosition) +
          keyEvent.key +
          getCurrentValue().slice(currentPosition + 1)

        const nextPos = Math.min(currentPosition + 1, getLength() - 1)

        setCurrentValue(newValue)

        const $input = getInput()

        if ($input) {
          $input.value = newValue
          $input.setSelectionRange(nextPos, nextPos)
        }

        update()

        return
      }

      if (JUMP_TO_START_KEYS.includes(keyEvent.key as Key)) {
        keyEvent.preventDefault()

        setIsSelecting(false)

        if (getInput()?.selectionStart === 0) return

        getInput()?.setSelectionRange(0, 0)

        requestAnimationFrame(() => update())

        return
      }

      if (JUMP_TO_END_KEYS.includes(keyEvent.key as Key)) {
        keyEvent.preventDefault()

        setIsSelecting(false)

        const endPosition = Math.min(getCurrentValue().length, getLength() - 1)

        if (getInput()?.selectionStart === endPosition) return

        getInput()?.setSelectionRange(endPosition, endPosition)

        requestAnimationFrame(() => update())

        return
      }

      if (keyEvent.key === Key.Backspace) {
        keyEvent.preventDefault()

        if (getIsSelecting()) {
          clearSelection()

          return
        }

        const cursorPosition = getInput()?.selectionStart ?? 0

        if (getCurrentValue().length === 0) return

        // if current slot is empty, delete the previous character and move back
        // otherwise delete the character at the current position
        const isCursorAtEnd = cursorPosition >= getCurrentValue().length

        const currentSlotIsEmpty =
          isCursorAtEnd || !getCurrentValue()[cursorPosition]

        const startSlice = currentSlotIsEmpty
          ? getCurrentValue().slice(0, cursorPosition - 1)
          : getCurrentValue().slice(0, cursorPosition)

        const endSlice = currentSlotIsEmpty
          ? getCurrentValue().slice(cursorPosition)
          : getCurrentValue().slice(cursorPosition + 1)

        const newValue = startSlice + endSlice
        const newPos = currentSlotIsEmpty ? cursorPosition - 1 : cursorPosition

        setCurrentValue(newValue)

        const $input = getInput()

        if ($input) {
          $input.value = newValue
          $input.setSelectionRange(newPos, newPos)
        }

        update()
        return
      }

      if (keyEvent.key === Key.Delete) {
        keyEvent.preventDefault()

        if (getIsSelecting()) {
          clearSelection()

          return
        }

        const cursorPosition = getInput()?.selectionStart ?? 0

        // nothing to delete if cursor is past the last filled slot
        if (cursorPosition >= getCurrentValue().length) return

        const newValue =
          getCurrentValue().slice(0, cursorPosition) +
          getCurrentValue().slice(cursorPosition + 1)

        setCurrentValue(newValue)

        const $input = getInput()

        if ($input) {
          $input.value = newValue
          $input.setSelectionRange(cursorPosition, cursorPosition)
        }

        update()

        return
      }

      const isHorizontalArrow = HORIZONTAL_ARROW_KEYS.includes(
        keyEvent.key as Key
      )

      if (isHorizontalArrow) {
        keyEvent.preventDefault()

        const rawCursor = getInput()?.selectionStart ?? 0
        const cursorPosition = Math.min(rawCursor, getLength() - 1)

        if (getIsSelecting()) {
          setIsSelecting(false)

          if (keyEvent.key === Key.Right) {
            const endPosition = Math.min(
              getCurrentValue().length,
              getLength() - 1
            )

            getInput()?.setSelectionRange(endPosition, endPosition)
          } else {
            getInput()?.setSelectionRange(0, 0)
          }

          update()
          return
        }

        // ctrl/meta + arrow — jump to start or end
        if (keyEvent.ctrlKey || keyEvent.metaKey) {
          if (keyEvent.key === Key.Left) {
            getInput()?.setSelectionRange(0, 0)
          } else {
            const endPosition = Math.min(
              getCurrentValue().length,
              getLength() - 1
            )

            getInput()?.setSelectionRange(endPosition, endPosition)
          }

          update()
          return
        }

        const isLeftMove = keyEvent.key === Key.Left
        const isRightMove = keyEvent.key === Key.Right

        const isAtStart = cursorPosition <= 0
        const isAtEnd =
          cursorPosition >= Math.min(getCurrentValue().length, getLength() - 1)

        if ((isLeftMove && isAtStart) || (isRightMove && isAtEnd)) {
          return
        }

        const newPosition = isLeftMove ? cursorPosition - 1 : cursorPosition + 1
        getInput()?.setSelectionRange(newPosition, newPosition)

        update()
      }
    },
    { signal }
  )
}
