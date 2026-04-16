# Changelog

## [0.1.0] - 2026-04-16

### Added

- `<pin-input>` web component — headless, accessible, zero dependencies
- `length` attribute — number of input slots (default: 6)
- `value` attribute — initial value
- `pattern` attribute — regex pattern for valid characters (default: `[0-9]`)
- `name` attribute — for native form participation
- `autocomplete` attribute — defaults to `one-time-code` for SMS autofill
- `disabled` attribute — disables the input
- `invalid` attribute — marks the input as invalid
- `required` attribute — for HTML5 form validation
- `autofocus` attribute — focuses the input on mount
- `mask` attribute — masks entered characters showing `•`, real value still emitted in events
- `separators` attribute — renders separators between slots at specified positions
- `aria-label` attribute — accessible label for the input group
- `aria-describedby` attribute — for accessibility descriptions
- `pin-change` event — fired on every value change with `{ value: string }`
- `pin-complete` event — fired when all slots are filled with `{ value: string }`
- `::part(wrapper)` — outer container
- `::part(slot)` — each character slot
- `::part(slot active)` — currently focused slot
- `::part(slot filled)` — slot with a character
- `::part(slot masked)` — filled slot when `mask` is active
- `::part(slot error)` — slot in error state
- `::part(slot selected)` — slot in selected state
- `::part(separator)` — separator element between slots
- `::part(cursor)` — cursor inside the active empty slot
- Smart paste — distributes pasted text across slots automatically
- Full keyboard navigation — arrows, Backspace, Home, End, Tab
- Text selection — Ctrl+A and double click to select all filled slots
- Native form participation via `ElementInternals`
- Custom Elements Manifest for editor autocompletion
