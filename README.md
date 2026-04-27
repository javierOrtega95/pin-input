# pin-input

> A headless, accessible PIN/OTP web component. Framework-agnostic, zero dependencies, with native form participation.

[![npm version](https://img.shields.io/npm/v/@javierortega95/pin-input?color=58a6ff)](https://www.npmjs.com/package/@javierortega95/pin-input)
[![bundle size](https://deno.bundlejs.com/badge?q=@javierortega95/pin-input)](https://bundlejs.com/?q=@javierortega95/pin-input)
[![license](https://img.shields.io/npm/l/@javierortega95/pin-input?color=58a6ff)](./LICENSE)

```html
<pin-input length="6"></pin-input>
```

**[Live demo →](https://javierortega95.github.io/pin-input/)**

---

## Features

- 🎨 **Headless** — unstyled by default, fully customizable via `::part()`
- ♿ **Accessible** — `role="group"`, full keyboard navigation, screen reader friendly
- 📋 **Smart paste** — distributes pasted text across slots automatically
- 📱 **Autofill** — `autocomplete="one-time-code"` for SMS autofill on mobile
- 📝 **Form participation** — works with native `<form>`, `FormData` and HTML5 validation
- 🔧 **Framework-agnostic** — works in Vanilla JS, React, Vue, Angular, and any framework

---

## Installation

```bash
npm install @javierortega95/pin-input
pnpm add @javierortega95/pin-input
yarn add @javierortega95/pin-input
```

Or via CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@javierortega95/pin-input@0.2.0/dist/pin-input.js"></script>
```

---

## Usage

### Vanilla JS

```html
<pin-input length="6" name="otp" autocomplete="one-time-code"></pin-input>

<script type="module">
  import '@javierortega95/pin-input'

  const input = document.querySelector('pin-input')

  input.addEventListener('pin-change', (e) => {
    console.log(e.detail.value) // "123"
  })

  input.addEventListener('pin-complete', (e) => {
    console.log(e.detail.value) // "123456"
  })
</script>
```

### React 19

```tsx
import '@javierortega95/pin-input'

export default function App() {
  return (
    <pin-input
      length="6"
      name="otp"
      autocomplete="one-time-code"
      onpin-change={(e) => console.log(e.detail.value)}
      onpin-complete={(e) => console.log(e.detail.value)}
    />
  )
}
```

> **React 18 and earlier:** use `useRef` + `addEventListener` to listen to events, as inline event handlers for custom events are not supported.

### Vue

```vue
<script setup>
import '@javierortega95/pin-input'

function onPinChange(e) {
  console.log('change:', e.detail.value)
}

function onPinComplete(e) {
  console.log('complete:', e.detail.value)
}
</script>

<template>
  <pin-input
    length="6"
    name="otp"
    autocomplete="one-time-code"
    @pin-change="onPinChange"
    @pin-complete="onPinComplete"
  />
</template>
```

### Angular

```ts
import '@javierortega95/pin-input'
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'

@Component({
  selector: 'app-root',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <pin-input
      length="6"
      name="otp"
      autocomplete="one-time-code"
      (pin-change)="onPinChange($event)"
      (pin-complete)="onPinComplete($event)"
    ></pin-input>
  `,
})
export class App {
  onPinChange(e: Event) {
    console.log('change:', (e as CustomEvent).detail.value)
  }

  onPinComplete(e: Event) {
    console.log('complete:', (e as CustomEvent).detail.value)
  }
}

bootstrapApplication(App)
```

> **Note:** `CUSTOM_ELEMENTS_SCHEMA` is required for Angular to recognize `<pin-input>` as a valid element.

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
| `inputmode`        | `string`  | `numeric`       | Virtual keyboard type on mobile devices         |
| `disabled`         | `boolean` | `false`         | Disables the input                              |
| `invalid`          | `boolean` | `false`         | Marks the input as invalid                      |
| `required`         | `boolean` | `false`         | Marks the input as required for form validation |
| `autofocus`        | `boolean` | `false`         | Focuses the input on mount                      |
| `mask`             | `boolean` | `false`         | Masks the input characters (e.g. for passwords) |
| `separators`       | `string`  | —               | Slot positions after which a separator renders  |
| `aria-label`       | `string`  | —               | Accessible label for the input group            |
| `aria-describedby` | `string`  | —               | ID of the element that describes the input      |

### Events

| Event          | When                         | Detail              |
| -------------- | ---------------------------- | ------------------- |
| `pin-change`   | Every time the value changes | `{ value: string }` |
| `pin-complete` | When all slots are filled    | `{ value: string }` |

### CSS Parts

| Part            | Description                                       |
| --------------- | ------------------------------------------------- |
| `wrapper`       | The outer container with `role="group"`           |
| `slot`          | Each individual character slot                    |
| `slot active`   | The currently focused slot                        |
| `slot filled`   | A slot that contains a character                  |
| `slot error`    | A slot in error state (when `invalid` is set)     |
| `slot selected` | A slot in selected state (Ctrl+A or double click) |
| `slot masked`   | A slot that is masked (when `mask` is set)        |
| `separator`     | A separator element between slots                 |
| `cursor`        | The cursor element inside the active empty slot   |


### Keyboard Navigation

| Key | Action |
| --- | ------ |
| `Tab` | Focus in / out of the component as a single unit |
| `←` `→` | Move between slots |
| `↑` / `Home` | Jump to first slot |
| `↓` / `End` | Jump to last filled slot |
| `Ctrl/⌘` + `←` | Jump to first slot |
| `Ctrl/⌘` + `→` | Jump to last filled slot |
| `Backspace` | Delete character and move back |
| `Delete` | Delete character at current position |
| `Ctrl/⌘` + `A` | Select all slots |
| `Ctrl/⌘` + `X` | Cut selection to clipboard |

---

## Styling

`<pin-input>` is completely unstyled. Use `::part()` to style each state:

```css
pin-input::part(wrapper) {
  display: flex;
  gap: 8px;
}

pin-input::part(slot) {
  width: 48px;
  height: 56px;
  border: 1.5px solid #d0d7de;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

pin-input::part(slot filled) {
  border-color: #94a3b8;
}

pin-input::part(slot active) {
  border-color: #58a6ff;
}

pin-input::part(slot error) {
  border-color: #f85d7f;
  background: #fff0f3;
}

pin-input::part(slot selected) {
  background: #eff6ff;
  border-color: #58a6ff;
}

pin-input::part(slot masked) {
  color: #58a6ff;
}

pin-input::part(cursor) {
  width: 1.5px;
  height: 22px;
  background: #58a6ff;
  animation: blink 1s step-end infinite;
}

pin-input::part(separator) {
  width: 12px;
  height: 2px;
  background: #cbd5e1;
  border-radius: 2px;
}
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feat/your-feature`
3. Make your changes and add tests if needed
4. Run the test suite: `pnpm test`
5. Commit following [Conventional Commits](https://www.conventionalcommits.org/): `feat: add your feature`
6. Open a pull request

### Development setup

```bash
git clone https://github.com/javierOrtega95/pin-input.git
cd pin-input
pnpm install
pnpm dev     # start dev server
pnpm test    # run tests
pnpm build   # build for production
```
