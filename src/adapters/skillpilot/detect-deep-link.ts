import type { DeepLink, SessionState } from '../../core/contracts'
import { isSkillpilotDeepLink } from '../../core/student-policy'

export const detectDeepLinks = (
  state: SessionState,
  skillpilotBaseUrl = 'https://skillpilot.com'
): DeepLink[] =>
  (state.lastAssistantTurn?.links ?? []).filter((link) =>
    isSkillpilotDeepLink(link.url, skillpilotBaseUrl)
  )

export const detectFirstDeepLink = (
  state: SessionState,
  skillpilotBaseUrl = 'https://skillpilot.com'
): DeepLink | undefined => detectDeepLinks(state, skillpilotBaseUrl)[0]
