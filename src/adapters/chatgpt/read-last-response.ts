import type { ChatTurn, SessionState, StudentSession } from '../../core/contracts'
import { detectGptState } from './detect-gpt-state'

export const readLastResponse = async (
  session: StudentSession
): Promise<{ state: SessionState; assistantTurn: ChatTurn }> => {
  const state = await session.refreshState()
  const detected = detectGptState(state)
  const enrichedState: SessionState = {
    ...state,
    detected
  }

  if (!enrichedState.lastAssistantTurn) {
    throw new Error('No assistant response found in current ChatGPT session')
  }

  return {
    state: enrichedState,
    assistantTurn: enrichedState.lastAssistantTurn
  }
}
