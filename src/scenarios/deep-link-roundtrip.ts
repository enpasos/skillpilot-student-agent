import type { Scenario } from '../core/contracts'
import { runResumeFlow } from './resume-with-uuid'

export const deepLinkRoundtripScenario: Scenario = {
  name: 'deep-link-roundtrip',
  run: (runtime) => runResumeFlow(runtime, true)
}
