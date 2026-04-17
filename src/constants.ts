/** Default number of slots. */
export const DEFAULT_LENGTH = 6

/** Default pattern for valid characters. */
export const DEFAULT_PATTERN = '[0-9]'

/** Default autocomplete attribute value. */
export const DEFAULT_AUTOCOMPLETE = 'one-time-code'

/** Default inputmode attribute value. */
export const DEFAULT_INPUTMODE = 'numeric'

/** Keyboard key values used throughout the component. */
export enum Key {
  Up = 'ArrowUp',
  Down = 'ArrowDown',
  Left = 'ArrowLeft',
  Right = 'ArrowRight',
  Backspace = 'Backspace',
  Delete = 'Delete',
  Home = 'Home',
  End = 'End',
  A = 'a',
}

/** Keys that move the cursor to the previous slot or the start. */
export const HORIZONTAL_ARROW_KEYS = [Key.Left, Key.Right]

/** Keys that jump the cursor to the first slot. */
export const JUMP_TO_START_KEYS = [Key.Up, Key.Home]

/** Keys that jump the cursor to the last filled slot. */
export const JUMP_TO_END_KEYS = [Key.Down, Key.End]
