import { chromium, type Browser, type BrowserContext, type Page } from 'playwright'

export interface BrowserDriverOptions {
  headless: boolean
  storageStatePath?: string
}

export interface BrowserDriver {
  start(): Promise<void>
  goto(url: string): Promise<void>
  currentUrl(): Promise<string>
  typeIntoFirst(selectors: string[], value: string): Promise<void>
  clickFirst(selectors: string[]): Promise<void>
  waitForIdle(milliseconds: number): Promise<void>
  evaluate<T>(pageFunction: () => T): Promise<T>
  screenshot(targetPath: string): Promise<void>
  goBack(): Promise<void>
  close(): Promise<void>
}

export class OpenClawBrowserDriver implements BrowserDriver {
  private browser?: Browser
  private context?: BrowserContext
  private page?: Page

  constructor(private readonly options: BrowserDriverOptions) {}

  async start(): Promise<void> {
    if (this.page) {
      return
    }

    this.browser = await chromium.launch({ headless: this.options.headless })
    this.context = await this.browser.newContext(
      this.options.storageStatePath ? { storageState: this.options.storageStatePath } : {}
    )
    this.page = await this.context.newPage()
  }

  async goto(url: string): Promise<void> {
    const page = this.requirePage()
    await page.goto(url, { waitUntil: 'domcontentloaded' })
  }

  async currentUrl(): Promise<string> {
    return this.requirePage().url()
  }

  async typeIntoFirst(selectors: string[], value: string): Promise<void> {
    const page = this.requirePage()
    for (const selector of selectors) {
      const locator = page.locator(selector).first()
      if ((await locator.count()) > 0) {
        await locator.click()
        await locator.fill(value)
        return
      }
    }

    throw new Error(`No input selector matched: ${selectors.join(', ')}`)
  }

  async clickFirst(selectors: string[]): Promise<void> {
    const page = this.requirePage()
    for (const selector of selectors) {
      const locator = page.locator(selector).first()
      if ((await locator.count()) > 0) {
        await locator.click()
        return
      }
    }

    throw new Error(`No clickable selector matched: ${selectors.join(', ')}`)
  }

  async waitForIdle(milliseconds: number): Promise<void> {
    await this.requirePage().waitForTimeout(milliseconds)
  }

  async evaluate<T>(pageFunction: () => T): Promise<T> {
    return this.requirePage().evaluate(pageFunction)
  }

  async screenshot(targetPath: string): Promise<void> {
    await this.requirePage().screenshot({ path: targetPath, fullPage: true })
  }

  async goBack(): Promise<void> {
    await this.requirePage().goBack({ waitUntil: 'domcontentloaded' })
  }

  async close(): Promise<void> {
    await this.context?.close()
    await this.browser?.close()
    this.page = undefined
    this.context = undefined
    this.browser = undefined
  }

  private requirePage(): Page {
    if (!this.page) {
      throw new Error('Browser driver not started')
    }
    return this.page
  }
}
