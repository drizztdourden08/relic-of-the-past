/* @layer renderer-app @kind logic */
import type { JoinedContext } from '@drizztdourden08/brock-randomizer';
import { joinFromForm, lobbyWatch, writeMembership } from '@drizztdourden08/brock-randomizer/renderer';

type JoinedLobby = Extract<Awaited<ReturnType<typeof joinFromForm>>, { ok: true }>;

const onRotpJoined = async (result: unknown, { profileId }: JoinedContext): Promise<void> => {
  const joined = result as JoinedLobby;
  await writeMembership(profileId, joined.membership);
  lobbyWatch.adopt(profileId, joined.session, joined.membership);
};

export { onRotpJoined };
