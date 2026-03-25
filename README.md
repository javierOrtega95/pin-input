## A headless, accessible PIN/OTP web component. Framework-agnostic, zero dependencies, with native form participation.

```html
<pin-input length="6"></pin-input>
```

---

## Features

- 🎨 **Headless** — unstyled by default, fully customizable via `::part()`
- ♿ **Accessible** — `role="group"`, full keyboard navigation, screen reader friendly
- 📋 **Smart paste** — distributes pasted text across slots automatically
- 📱 **Autofill** — `autocomplete="one-time-code"` for SMS autofill on mobile
- 📝 **Form participation** — works with native `<form>`, `FormData` and HTML5 validation
- 🔧 **Framework-agnostic** — works in vanilla JS, React, Vue, Astro, and any framework

---

## Usage

```html
<pin-input length="6" name="otp"></pin-input>

<script type="module">
  import '@javierortega95/pin-input'

  const input = document.querySelector('pin-input')

  input.addEventListener('pin-complete', (e) => {
    console.log(e.detail.value) // "123456"
  })
</script>
```

---

## API

### Attributes

| Attribute          | Type      | Default         | Description                                     |
| ------------------ | --------- | --------------- | ----------------------------------------------- |
| `length`           | `number`  | `6`             | Number of slots                                 |
| `value`            | `string`  | `""`            | Initial value                                   |
| `pattern`          | `string`  | `[0-9]`         | Regex pattern for valid characters              |
| `name`             | `string`  | —               | Field name for form submission                  |
| `autocomplete`     | `string`  | `one-time-code` | Autocomplete attribute on the internal input    |
| `disabled`         | `boolean` | `false`         | Disables the input                              |
| `invalid`          | `boolean` | `false`         | Marks the input as invalid                      |
| `required`         | `boolean` | `false`         | Marks the input as required for form validation |
| `autofocus`        | `boolean` | `false`         | Focuses the input on mount                      |
| `separators`       | `string`  | —               | Slot positions after which a separator renders  |
| `aria-label`       | `string`  | —               | Accessible label for the input group            |
| `aria-describedby` | `string`  | —               | ID of the element that describes the input      |

### Events

| Event          | When                         | Detail              |
| -------------- | ---------------------------- | ------------------- |
| `pin-change`   | Every time the value changes | `{ value: string }` |
| `pin-complete` | When all slots are filled    | `{ value: string }` |

### Parts

| Part            | Description                                       |
| --------------- | ------------------------------------------------- |
| `wrapper`       | The outer container with `role="group"`           |
| `slot`          | Each individual character slot                    |
| `slot active`   | The currently focused slot                        |
| `slot filled`   | A slot that contains a character                  |
| `slot error`    | A slot in error state (when `invalid` is set)     |
| `slot selected` | A slot in selected state (Ctrl+A or double click) |
| `separator`     | A separator element between slots                 |
| `cursor`        | The cursor element inside the active empty slot   |

---

## Styling

`<pin-input>` is completely unstyled. Use `::part()` to style each state:
```css
pin-input::part(slot) {
  width: 48px;
  height: 56px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 24px;
}

pin-input::part(slot active) {
  border-color: #3b82f6;
}

pin-input::part(slot filled) {
  border-color: #94a3b8;
}

pin-input::part(slot error) {
  border-color: #ef4444;
}

pin-input::part(slot selected) {
  background-color: #eff6ff;
  border-color: #3b82f6;
}

pin-input::part(cursor) {
  width: 2px;
  height: 24px;
  background-color: #3b82f6;
  animation: blink 1s step-end infinite;
}

pin-input::part(separator) {
  width: 8px;
  height: 2px;
  background-color: #e2e8f0;
  margin: 0 4px;
}
```
