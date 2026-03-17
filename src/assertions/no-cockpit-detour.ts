import type { ScenarioAssertion, ScenarioResult } from '../core/contracts'

export const noCockpitDetourAssertion: ScenarioAssertion = {
  name: 'no-cockpit-detour',
  assert(result: ScenarioResult) {
    const detours = result.outcome?.prohibitedDetours ?? []
    if (detours.length > 0) {
      throw new Error(`Forbidden cockpit detour detected: ${detours.join(', ')}`)
    }
  }
}
