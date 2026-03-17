import type { DetectedGptState, SessionState } from '../../core/contracts'
import {
  detectProhibitedDetours,
  detectResumeSignals,
  inferResumeConfidence
} from '../../core/student-policy'
import { detectDeepLinks } from '../skillpilot/detect-deep-link'

export const detectGptState = (state: SessionState): DetectedGptState => {
  const assistantText = state.lastAssistantTurn?.text ?? ''
  const deepLinks = detectDeepLinks(state)
  const prohibitedDetours = detectProhibitedDetours(assistantText)
  const resumeSignals = detectResumeSignals(assistantText, deepLinks)

  return {
    deepLinks,
    prohibitedDetours,
    resumeSignals,
    resumeConfidence: inferResumeConfidence(assistantText, deepLinks, prohibitedDetours)
  }
}
