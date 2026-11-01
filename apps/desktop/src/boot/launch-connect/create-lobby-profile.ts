/* @layer renderer-app @kind logic */
import { slotNameError } from '@rotp/randomizer';
import { EMPTY_LOBBY_DRAFT } from '@app/hooks/randomizer/lobby-setup';
import type { LobbyCheckOk } from '@app/game/archipelia';
import { log } from '@app/log-bus';
import { runCreateProfileFlow } from '@app/views/GameSession/behavior/create-profile-flow';
import { buildRandomizerConfig, freshRandomizerForm } from '@app/views/DataManager/sub-components/profile-manager/build-randomizer-config';
import { createArchipeliaProfile } from '@app/views/DataManager/sub-components/profile-manager/create-archipelia-profile';
import { baseOptionsOf } from './profile-seed';

/**
 * Creates an Archipelia profile named `name` (which is also its slot name) and joins the checked lobby with it,
 * through the same code the profile form runs. The lobby fixes the server, code and build; the options are the
 * form's defaults, because a lobby publishes no per-slot options.
 */
const createLobbyProfile = async (active: Profile, name: string, check: LobbyCheckOk): Promise<Profile | null> => {
  const slotProblem = slotNameError(name);
  if (slotProblem !== null || name === '') {
    log.app(`--lobby-join refused: "${name}" cannot be a slot name (${slotProblem ?? 'it is empty'})`, 'error');
    return null;
  }
  const form = { ...freshRandomizerForm(), enabled: true, mode: 'archipelia' as const, lobby: { ...EMPTY_LOBBY_DRAFT, slotName: name }, lobbyCheck: check };
  const opts = { ...baseOptionsOf(active, name), randomizer: buildRandomizerConfig(form, true) };
  const result = await createArchipeliaProfile(opts, check, runCreateProfileFlow, () => undefined);
  if (!result.success) {
    log.app(`--lobby-join refused: ${result.error}`, 'error');
    return null;
  }
  log.app(`[LaunchConnect] Created Archipelia profile "${name}" and joined lobby "${check.name}"`);
  return result.profile;
};

export { createLobbyProfile };
