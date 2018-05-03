import isHtml = require('is-html')
import * as puppeteer from 'puppeteer'

import * as selectors from './selectors'
import {DRAFTS_NEW_URL, DRAFTS_URL, LOGIN_URL, RECOVER_URL, TOP_URL, TWO_FACTOR_AUTH_URL} from './urls'

export const upload = async (
  filepath: string,
  options: {username: string, password: string, backupcode?: string, verbose?: boolean}
): Promise<string> => {
  const {username, password, backupcode, verbose} = options
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    if (verbose) {
      await page.setRequestInterception(true)

      page.on('request', request => {
        console.log( // tslint:disable-line
          '== `request` ==\n\n' +
          `  > ${request.method()} ${request.url()}`
        )
        console.log( // tslint:disable-line
          '  > headers:\n', request.headers(), '\n\n'
        )
        request.continue()
      })
      page.on('requestfinished', request => {
        console.log( // tslint:disable-line
          '== `requestfinished` ==\n\n' +
          `  > ${request.url()}` +
          '\n\n'
        )
      })
      page.on('requestfailed', request => {
        console.log( // tslint:disable-line
          '== `requestfailed` ==\n\n' +
          `  > ${request.url()}`
        )
        console.log(request.failure(), '\n\n') // tslint:disable-line
      })
    }

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

    // Log out
    await page.goto(TOP_URL)
    const userMenuOpenButton = await page.$(selectors.userMenuOpenButton)
    if (userMenuOpenButton) {
      await userMenuOpenButton.click()
    } else {
      throw new Error(`Can't find \`${selectors.userMenuOpenButton}\``)
    }
    const userMenu = await page.$(selectors.userMenu)
    const userMenuItems = await userMenu.$$(selectors.userMenuItems)
    await userMenuItems[userMenuItems.length - 1].click()
    await page.waitForNavigation({waitUntil: 'networkidle2'})

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
