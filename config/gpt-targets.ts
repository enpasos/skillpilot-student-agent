import type { GptTarget, Language } from '../src/core/contracts'

export const SKILLPILOT_GPT_URL_EN =
  'https://chatgpt.com/g/g-69a565a532008191a3b994e83d20241c-skillpilot-gpt-english'

export const SKILLPILOT_GPT_URL_DE =
  'https://chatgpt.com/g/g-693ebdcb2fac8191b3a765ce7f451fb2-skillpilot-gpt-deutsch'

export const SKILLPILOT_GPT_TARGETS: Record<Language, GptTarget> = {
  de: {
    key: 'de',
    label: 'SkillPilot GPT Deutsch',
    url: SKILLPILOT_GPT_URL_DE
  },
  en: {
    key: 'en',
    label: 'SkillPilot GPT English',
    url: SKILLPILOT_GPT_URL_EN
  }
}

export const getGptTarget = (language?: string): GptTarget => {
  const normalized = (language ?? '').trim().toLowerCase()
  return normalized.startsWith('en')
    ? SKILLPILOT_GPT_TARGETS.en
    : SKILLPILOT_GPT_TARGETS.de
}
