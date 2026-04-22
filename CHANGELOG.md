# Changelog

## [0.1.4] - 2026-04-22

### Fixed

- Clicking to focus now correctly positions the cursor on the next empty slot instead of always landing on the first slot. The previous check used `document.activeElement` to verify focus before repositioning the cursor, but in Shadow DOM `document.activeElement` returns the host element (`<pin-input>`), not the internal `<input>` — so the check always failed and the cursor was never repositioned. Fixed by using `input.matches(':focus')` which correctly resolves focus within the shadow root.

## [0.1.3] - 2026-04-22

### Fixed

- Arrow key navigation now works correctly in Firefox. The previous implementation relied on `requestAnimationFrame` to read the cursor position after the browser moved it, but Firefox executed the callback before the cursor had actually moved, causing a one-frame visual lag. Arrow keys now use `preventDefault` and move the cursor explicitly via `setSelectionRange`.
- Tabbing into a prefilled input now correctly positions the cursor on the last filled slot. The browser's default tab-focus selection was overriding the cursor placement set in the focus handler.

## [0.1.2] - 2026-04-18

### Fixed

- Added `inputmode` attribute (default: `numeric`) so mobile devices show the numeric keyboard by default, matching the default `pattern="[0-9]"`. The value can be overridden with any valid `inputmode` value (e.g. `"text"`, `"decimal"`, `"tel"`).

## [0.1.1] - 2026-04-16

### Fixed

- Added property setters for all public attributes to ensure compatibility with React 19

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
