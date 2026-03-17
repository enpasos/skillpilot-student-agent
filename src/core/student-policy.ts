import type { DeepLink } from './contracts'

export const PROHIBITED_DETOUR_FRAGMENTS = [
  'open the cockpit first',
  'oeffne zuerst das cockpit',
  'öffne zuerst das cockpit',
  'type ready',
  'tippe bereit',
  'the id alone is not enough',
  'die id allein reicht nicht',
  'die id allein ist nicht genug',
  'browser activation',
  'website activation'
] as const

const RESUME_SIGNAL_PATTERNS = [
  /learning goal:/i,
  /lernziel:/i,
  /start exercise/i,
  /starten wir/i,
  /we practice/i,
  /wir ueben/i,
  /wir üben/i,
  /next step/i,
  /naechste/i,
  /nächste/i,
  /your achievements in the cockpit/i,
  /deine erfolge im cockpit/i
]

export const detectProhibitedDetours = (text: string): string[] => {
  const normalized = normalizeWhitespace(text).toLowerCase()
  return PROHIBITED_DETOUR_FRAGMENTS.filter((fragment) =>
    normalized.includes(fragment.toLowerCase())
  )
}

export const detectResumeSignals = (text: string, deepLinks: DeepLink[]): string[] => {
  const matches = RESUME_SIGNAL_PATTERNS.flatMap((pattern) =>
    pattern.test(text) ? [pattern.source] : []
  )
  if (deepLinks.length > 0) {
    matches.push('deep-link')
  }
  if (matches.length === 0 && normalizeWhitespace(text).length > 0) {
    matches.push('non-empty-assistant-response')
  }
  return matches
}

export const inferResumeConfidence = (
  text: string,
  deepLinks: DeepLink[],
  prohibitedDetours: string[]
): 'low' | 'medium' | 'high' => {
  if (prohibitedDetours.length > 0 || normalizeWhitespace(text).length === 0) {
    return 'low'
  }
  if (deepLinks.length > 0 || detectResumeSignals(text, deepLinks)[0] !== 'non-empty-assistant-response') {
    return 'high'
  }
  return 'medium'
}

export const isSkillpilotDeepLink = (url: string, baseUrl = 'https://skillpilot.com'): boolean => {
  try {
    const candidate = new URL(url)
    const base = new URL(baseUrl)
    return candidate.hostname === base.hostname
  } catch {
    return false
  }
}

export const normalizeWhitespace = (text: string): string =>
  text.replace(/\s+/g, ' ').trim()
