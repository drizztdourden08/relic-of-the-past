/* @layer renderer-app @kind logic */
import { joinFromForm, lobbyWatch, writeMembership } from '@drizztdourden08/brock-randomizer/renderer';
import type { LobbyCheckOk } from '@drizztdourden08/brock-randomizer/renderer';
import { log } from '@app/log-bus';
import { refuseLobbyJoin as refuse } from './refuse-lobby-join';

const joinWithProfile = async (profile: Profile, check: LobbyCheckOk): Promise<Profile | null> => {
  const config = profile.randomizer;
  if (config?.mode !== 'archipelia') return refuse(`profile "${profile.name}" is not an Archipelia profile`);
  const joined = await joinFromForm(check, config, { wanted: null, onProgress: () => undefined });
  if (!joined.ok) return refuse(joined.error, joined.code);
  await writeMembership(profile.id, joined.membership);
  lobbyWatch.adopt(profile.id, joined.session, joined.membership);
  log.app(`[LaunchConnect] Joined lobby "${check.name}" as profile "${profile.name}"`);
  return profile;
};

export { joinWithProfile };
