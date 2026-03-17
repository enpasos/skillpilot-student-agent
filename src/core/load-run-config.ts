import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getGptTarget } from '../../config/gpt-targets'
import type { LoadedRunConfig, Language } from './contracts'

interface RawRunConfig {
  language?: string
  artifactsDir?: string
  student?: {
    skillpilotId?: string
    returnMessageAfterDeepLink?: string
  }
  chatGpt?: {
    headless?: boolean
    assistantTimeoutMs?: number
    storageStatePath?: string
  }
  skillpilot?: {
    baseUrl?: string
  }
}

export const loadRunConfig = async (
  configPath: string,
  scenarioName: string
): Promise<LoadedRunConfig> => {
  const absoluteConfigPath = path.resolve(configPath)
  const raw = JSON.parse(await readFile(absoluteConfigPath, 'utf8')) as RawRunConfig
  const language = normalizeLanguage(raw.language)
  const skillpilotId = raw.student?.skillpilotId?.trim()

  if (!skillpilotId) {
    throw new Error(`Missing student.skillpilotId in ${absoluteConfigPath}`)
  }

  return {
    language,
    target: getGptTarget(language),
    skillpilotId,
    followUpMessageAfterReturn: raw.student?.returnMessageAfterDeepLink,
    artifactsRoot: path.resolve(raw.artifactsDir ?? './artifacts'),
    requireDeepLink: scenarioName === 'deep-link-roundtrip' || scenarioName === 'exam-mode',
    browser: {
      headless: raw.chatGpt?.headless ?? false,
      assistantTimeoutMs: raw.chatGpt?.assistantTimeoutMs ?? 45_000,
      storageStatePath: raw.chatGpt?.storageStatePath
        ? path.resolve(path.dirname(absoluteConfigPath), raw.chatGpt.storageStatePath)
        : undefined
    },
    skillpilotBaseUrl: raw.skillpilot?.baseUrl ?? 'https://skillpilot.com'
  }
}

const normalizeLanguage = (language?: string): Language =>
  (language ?? '').trim().toLowerCase().startsWith('en') ? 'en' : 'de'
