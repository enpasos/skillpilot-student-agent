import type { ScenarioAssertion, ScenarioResult } from '../core/contracts'

const requireOutcome = (result: ScenarioResult) => {
  if (!result.outcome) {
    throw new Error('Scenario produced no outcome')
  }
  return result.outcome
}

export const uuidLoadContractAssertion: ScenarioAssertion = {
  name: 'uuid-load-contract',
  assert(result) {
    const outcome = requireOutcome(result)

    if (outcome.resumeConfidence === 'low') {
      throw new Error('UUID resume confidence is low; assistant did not provide usable continuation evidence')
    }

    if (outcome.assistantText.trim().length === 0) {
      throw new Error('Assistant response is empty after UUID submission')
    }
  }
}
