import type { StudentSession } from '../../core/contracts'

export const returnToChat = async (session: StudentSession): Promise<void> => {
  await session.returnToChat()
}
