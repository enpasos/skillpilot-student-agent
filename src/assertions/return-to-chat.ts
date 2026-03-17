import type { ScenarioAssertion, ScenarioResult } from '../core/contracts'

export const returnToChatAssertion: ScenarioAssertion = {
  name: 'return-to-chat',
  assert(result: ScenarioResult) {
    const outcome = result.outcome
    if (!outcome) {
      throw new Error('Scenario produced no outcome')
    }

    if (outcome.deepLinkFollowed && !outcome.returnedToChat) {
      throw new Error('Deep link was followed, but the session did not return to chat')
    }

    if (outcome.deepLinkFollowed && !outcome.stateReloadedAfterReturn) {
      throw new Error('Chat did not continue from a usable state after returning from SkillPilot')
    }
  }
}
