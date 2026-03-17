import { readLastResponse } from '../adapters/chatgpt/read-last-response'
import { sendMessage } from '../adapters/chatgpt/send-message'
import { detectFirstDeepLink } from '../adapters/skillpilot/detect-deep-link'
import { followDeepLink } from '../adapters/skillpilot/follow-deep-link'
import { returnToChat } from '../adapters/skillpilot/return-to-chat'
import type { Scenario, ScenarioOutcome, ScenarioRuntime } from '../core/contracts'

export const runResumeFlow = async (
  runtime: ScenarioRuntime,
  requireDeepLink = false
): Promise<ScenarioOutcome> => {
  runtime.recordObservation({
    code: 'uuid-submit',
    level: 'info',
    message: 'Submitting SkillPilot UUID as the first learner turn',
    data: { skillpilotId: runtime.config.skillpilotId }
  })

  const initialState = await sendMessage(runtime.session, runtime.config.skillpilotId)
  const assistantText = initialState.lastAssistantTurn?.text ?? ''
  const detected = initialState.detected

  if (!detected) {
    throw new Error('GPT state detection missing after initial UUID submission')
  }

  let finalState = initialState
  let continuationText: string | undefined
  const deepLink = detectFirstDeepLink(initialState)
  let deepLinkFollowed = false
  let returnedToChat = false
  let stateReloadedAfterReturn = false

  if (requireDeepLink && !deepLink) {
    throw new Error('Scenario requires a SkillPilot deep link, but none was emitted by the assistant')
  }

  if (deepLink) {
    runtime.recordObservation({
      code: 'deep-link-detected',
      level: 'info',
      message: 'Assistant emitted a SkillPilot deep link',
      data: { url: deepLink.url, label: deepLink.label }
    })

    await followDeepLink(runtime.session, deepLink)
    deepLinkFollowed = true

    await returnToChat(runtime.session)
    returnedToChat = true

    if (runtime.config.followUpMessageAfterReturn) {
      finalState = await sendMessage(runtime.session, runtime.config.followUpMessageAfterReturn)
    } else {
      const refreshed = await readLastResponse(runtime.session)
      finalState = refreshed.state
    }

    continuationText = finalState.lastAssistantTurn?.text
    stateReloadedAfterReturn = (finalState.detected?.resumeConfidence ?? 'low') !== 'low'
  }

  return {
    initialState,
    finalState,
    assistantText,
    continuationText,
    deepLink,
    deepLinkFollowed,
    returnedToChat,
    stateReloadedAfterReturn,
    prohibitedDetours: detected.prohibitedDetours,
    resumeConfidence: detected.resumeConfidence
  }
}

export const resumeWithUuidScenario: Scenario = {
  name: 'resume-with-uuid',
  run: (runtime) => runResumeFlow(runtime, false)
}
