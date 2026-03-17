import type { BrowserDriver } from './browser-driver'
import type { ChatTurn, DeepLink, GptTarget, SessionState, StudentSession } from '../../core/contracts'

interface ChatGptSessionOptions {
  assistantTimeoutMs: number
}

const PROMPT_SELECTORS = [
  '#prompt-textarea',
  'textarea[placeholder*="Message"]',
  'textarea[placeholder*="Nachricht"]'
]

const SEND_BUTTON_SELECTORS = [
  'button[data-testid="send-button"]',
  'button[aria-label*="Send message"]',
  'button[aria-label*="Nachricht senden"]'
]

export class ChatGptSession implements StudentSession {
  private target?: GptTarget
  private chatUrlBeforeDeepLink?: string

  constructor(
    private readonly driver: BrowserDriver,
    private readonly options: ChatGptSessionOptions
  ) {}

  async openTarget(target: GptTarget): Promise<void> {
    this.target = target
    await this.driver.start()
    await this.driver.goto(target.url)
    await this.driver.waitForIdle(2_000)
  }

  async sendLearnerMessage(message: string): Promise<void> {
    await this.driver.typeIntoFirst(PROMPT_SELECTORS, message)
    await this.driver.clickFirst(SEND_BUTTON_SELECTORS)
    await this.waitForAssistantSettled()
  }

  async refreshState(): Promise<SessionState> {
    if (!this.target) {
      throw new Error('ChatGPT session target not opened')
    }

    const currentUrl = await this.driver.currentUrl()
    const messages = await this.driver.evaluate<ChatTurn[]>(() => {
      const candidates = Array.from(document.querySelectorAll('[data-message-author-role]'))
      return candidates.map((node) => {
        const role =
          (node.getAttribute('data-message-author-role') as ChatTurn['role'] | null) ?? 'assistant'
        const links = Array.from(node.querySelectorAll('a[href]')).map((link) => ({
          url: (link as HTMLAnchorElement).href,
          label: link.textContent?.trim() || (link as HTMLAnchorElement).href,
          origin: 'assistant-markdown'
        })) as DeepLink[]

        return {
          role,
          text: (node.textContent ?? '').trim(),
          createdAt: new Date().toISOString(),
          links
        }
      })
    })

    const lastAssistantTurn = [...messages].reverse().find((message) => message.role === 'assistant')
    const lastUserTurn = [...messages].reverse().find((message) => message.role === 'user')

    return {
      target: this.target,
      currentUrl,
      messages,
      lastAssistantTurn,
      lastUserTurn
    }
  }

  async followDeepLink(link: DeepLink): Promise<void> {
    this.chatUrlBeforeDeepLink = await this.driver.currentUrl()
    await this.driver.goto(link.url)
    await this.driver.waitForIdle(2_000)
  }

  async returnToChat(): Promise<void> {
    if (this.chatUrlBeforeDeepLink) {
      await this.driver.goto(this.chatUrlBeforeDeepLink)
    } else {
      await this.driver.goBack()
    }
    await this.driver.waitForIdle(1_500)
  }

  async close(): Promise<void> {
    await this.driver.close()
  }

  private async waitForAssistantSettled(): Promise<void> {
    const timeoutAt = Date.now() + this.options.assistantTimeoutMs
    let stablePolls = 0
    let previousText = ''

    while (Date.now() < timeoutAt) {
      await this.driver.waitForIdle(1_000)
      const state = await this.refreshState()
      const currentText = state.lastAssistantTurn?.text ?? ''

      if (currentText.length > 0 && currentText === previousText) {
        stablePolls += 1
      } else {
        stablePolls = 0
      }

      if (stablePolls >= 2) {
        return
      }

      previousText = currentText
    }

    throw new Error('Assistant response did not settle within timeout')
  }
}
