export const DEFAULT_LENGTH = 6
export const DEFAULT_PATTERN = '[0-9]'
export const DEFAULT_AUTOCOMPLETE = 'one-time-code'

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

export const HORIZONTAL_ARROW_KEYS = [Key.Left, Key.Right]

export const JUMP_TO_START_KEYS = [Key.Up, Key.Home]
export const JUMP_TO_END_KEYS = [Key.Down, Key.End]
