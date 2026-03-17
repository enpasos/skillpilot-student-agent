import type { ScenarioAssertion, ScenarioResult } from '../core/contracts'

export const deepLinkFollowedAssertion: ScenarioAssertion = {
  name: 'deep-link-followed',
  assert(result: ScenarioResult) {
    const outcome = result.outcome
    if (!outcome) {
      throw new Error('Scenario produced no outcome')
    }

    if (outcome.deepLink && !outcome.deepLinkFollowed) {
      throw new Error('Assistant emitted a deep link but the student session did not follow it')
    }
  }
}
