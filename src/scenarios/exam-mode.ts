import type { Scenario } from '../core/contracts'
import { runResumeFlow } from './resume-with-uuid'

export const examModeScenario: Scenario = {
  name: 'exam-mode',
  run: (runtime) => runResumeFlow(runtime, true)
}
