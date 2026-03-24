import { beforeEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { getPinInput } from './helpers'

describe('form', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="form">
        <pin-input
          name="otp"
          style="display:block;width:300px;height:60px;"
        ></pin-input>
      </form>
    `
  })

  it('value is available in FormData with the correct name', async () => {
    const $pinInput = getPinInput()!

    await userEvent.click($pinInput)
    await userEvent.keyboard('123456')

    const $form = document.querySelector('#form') as HTMLFormElement
    const data = new FormData($form)

    expect(data.get('otp')).toBe('123456')
  })

  it('reflects empty value in FormData when cleared', async () => {
    const $pinInput = getPinInput()!

    await userEvent.click($pinInput)
    await userEvent.keyboard('123456')
    await userEvent.keyboard('{Control>}a{/Control}')
    await userEvent.keyboard('{Backspace}')

    const $form = document.querySelector('#form') as HTMLFormElement
    const data = new FormData($form)

    expect(data.get('otp')).toBe('')
  })

  it('required attribute triggers native form validation', () => {
    document.body.innerHTML = `
      <form id="form">
        <pin-input
          name="otp"
          required
          style="display:block;width:300px;height:60px;"
        ></pin-input>
      </form>
    `

    const $form = document.querySelector('#form') as HTMLFormElement

    expect($form.checkValidity()).toBe(false)
  })
})
