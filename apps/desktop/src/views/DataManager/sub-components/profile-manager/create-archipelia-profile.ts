/* @layer renderer-components @kind logic */
import { joinFromForm, lobbyWatch, writeMembership } from '@app/game/archipelia';
import type { LobbyCheck } from '@app/game/archipelia';
import type { CreateProfileOptions, CreateProfileResult } from '@app/profiles/types';
import { withDeliverable } from '@app/views/GameSession/behavior/with-deliverable';
import { NO_LOBBY_ERROR } from './build-randomizer-config/build-randomizer-config.constants';
import type { CreateFn } from './profile-manager.type';

const createArchipeliaProfile = async (
  opts: CreateProfileOptions, check: LobbyCheck, create: CreateFn, onProgress: (fraction: number) => void,
): Promise<CreateProfileResult> => {
  const ready = withDeliverable(opts);
  if (check.kind !== 'ok' || ready.randomizer === undefined) return { success: false, error: NO_LOBBY_ERROR };
  onProgress(0);
  const joined = await joinFromForm(check, ready.randomizer, onProgress);
  if (!joined.ok) return { success: false, error: joined.error };
  const result = await create(ready);
  if (!result.success) {
    joined.session.leave();
    return result;
  }
  await writeMembership(result.profile.id, joined.membership);
  lobbyWatch.adopt(result.profile.id, joined.session, joined.membership);
  return result;
};

export { createArchipeliaProfile };
