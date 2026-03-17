import type { DeepLink, StudentSession } from '../../core/contracts'

export const followDeepLink = async (
  session: StudentSession,
  link: DeepLink
): Promise<void> => {
  await session.followDeepLink(link)
}
