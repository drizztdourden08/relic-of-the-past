/* @layer renderer-app @kind logic */
import type { JoinedContext } from '@drizztdourden08/brock-randomizer';
import { lobbyWatch, writeMembership } from '@app/game/archipelia';
import type { JoinOutcome } from '@app/game/archipelia/join/join-input.type';

const onRotpJoined = async (result: unknown, { profileId }: JoinedContext): Promise<void> => {
  const joined = result as Extract<JoinOutcome, { ok: true }>;
  await writeMembership(profileId, joined.membership);
  lobbyWatch.adopt(profileId, joined.session, joined.membership);
};

export { onRotpJoined };
