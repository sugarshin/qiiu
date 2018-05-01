import isHtml = require('is-html')
import * as puppeteer from 'puppeteer'

import {DRAFTS_NEW_URL, DRAFTS_URL, LOGIN_URL, RECOVER_URL, TWO_FACTOR_AUTH_URL} from './constants'
import * as selectors from './selectors'

export const upload = async (
  filepath: string,
  options: {username: string, password: string, backupcode?: string}
): Promise<string> => {
  const {username, password, backupcode} = options
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    // Log into Qiita
    await page.goto(LOGIN_URL)
    await page.type(selectors.usernameInput, username)
    await page.type(selectors.passwordInput, password)
    const loginButton = await page.$(selectors.loginSessionsFormSubmit)
    if (loginButton) {
      await loginButton.click()
    } else {
      throw new Error(`Can't find \`${selectors.loginSessionsFormSubmit}\``)
    }
    await page.waitForNavigation({waitUntil: 'networkidle2'})

    // If Two-factor authentication enabled
    if (new RegExp(TWO_FACTOR_AUTH_URL).test(page.url())) {
      if (!backupcode) {
        throw new Error('This account is two-factor authentication enabled. should required backupcode.')
      }
      await page.goto(RECOVER_URL)
      await page.waitForSelector(selectors.recoveryCodeInput)
      await page.type(selectors.recoveryCodeInput, backupcode)
      const authorizeButton = await page.$(selectors.twoFactorAuthFormSubmit)
      if (authorizeButton) {
        await authorizeButton.click()
      } else {
        throw new Error(`Can't find \`${selectors.twoFactorAuthFormSubmit}\``)
      }
      await page.waitForNavigation({waitUntil: 'networkidle2'})
    }

    // New article creation
    await page.goto(DRAFTS_NEW_URL)
    await page.waitForSelector(selectors.fileUploadButton)
    const inputFile = await page.$(selectors.fileUploadButton)
    if (inputFile) {
      await inputFile.uploadFile(filepath)
    } else {
      throw new Error(`Can't find \`${selectors.fileUploadButton}\``)
    }
    await page.waitForNavigation({waitUntil: 'networkidle0'})

    const value: string = await page.$eval(selectors.markdownInputArea, (el: any) => el.value)

    // Delete current draft
    await page.goto(DRAFTS_URL)
    await page.waitForSelector(selectors.draftDeleteButton)
    const deleteButton = await page.$(selectors.draftDeleteButton)
    page.once('dialog', async dialog => {
      if (dialog.type() === 'confirm') {
        await dialog.accept()
      }
    })
    if (deleteButton) {
      await deleteButton.click()
    } else {
      throw new Error(`Can't find \`${selectors.draftDeleteButton}\``)
    }
    await page.waitForNavigation({waitUntil: 'networkidle0'})

    await browser.close()

    const ret = isHtml(value) ?
      value.match(/<img[^>]+src="([^">]+)"/) :
      value.match(/\!\[.*\]\((.+)\)/)
    if (ret) {
      return ret[1]
    } else {
      throw new Error('Couldn\'t upload image')
    }
  } catch (e) {
    throw e
  }
}
