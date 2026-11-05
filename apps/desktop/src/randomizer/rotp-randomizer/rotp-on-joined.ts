/* @layer renderer-app @kind logic */
import type { JoinedContext } from '@drizztdourden08/brock-randomizer';
import { lobbyWatch, writeMembership } from '@drizztdourden08/brock-randomizer/renderer';
import type { JoinOutcome } from '@drizztdourden08/brock-randomizer/renderer';

const onRotpJoined = async (result: unknown, { profileId }: JoinedContext): Promise<void> => {
  const joined = result as Extract<JoinOutcome, { ok: true }>;
  await writeMembership(profileId, joined.membership);
  lobbyWatch.adopt(profileId, joined.session, joined.membership);
};

export { onRotpJoined };
