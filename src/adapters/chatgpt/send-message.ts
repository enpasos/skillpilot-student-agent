import type { SessionState, StudentSession } from '../../core/contracts'
import { detectGptState } from './detect-gpt-state'

export const sendMessage = async (
  session: StudentSession,
  message: string
): Promise<SessionState> => {
  await session.sendLearnerMessage(message)
  const state = await session.refreshState()
  return {
    ...state,
    detected: detectGptState(state)
  }
}
