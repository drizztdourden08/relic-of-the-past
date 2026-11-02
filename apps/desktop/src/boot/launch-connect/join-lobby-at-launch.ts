/* @layer renderer-app @kind logic */
import { checkLobby, joinFromForm, lobbyWatch, writeMembership } from '@app/game/archipelia';
import type { LobbyCheckOk } from '@app/game/archipelia';
import { log } from '@app/log-bus';
import type { LobbyJoin } from '@app/launch-flags/lobby-join/lobby-join.type';
import { createLobbyProfile } from './create-lobby-profile';
import { pickLaunchProfile } from './pick-launch-profile';
import { waitForRoom } from './wait-for-room';

const refuse = (why: string): null => {
  log.app(`--lobby-join refused: ${why}`, 'error');
  return null;
};

const joinWithProfile = async (profile: Profile, check: LobbyCheckOk): Promise<Profile | null> => {
  const config = profile.randomizer;
  if (config?.mode !== 'archipelia') return refuse(`profile "${profile.name}" is not an Archipelia profile`);
  const joined = await joinFromForm(check, config, () => undefined);
  if (!joined.ok) return refuse(joined.error);
  await writeMembership(profile.id, joined.membership);
  lobbyWatch.adopt(profile.id, joined.session, joined.membership);
  log.app(`[LaunchConnect] Joined lobby "${check.name}" as profile "${profile.name}"`);
  return profile;
};

const joinLobbyAtLaunch = async (active: Profile, lobby: LobbyJoin, explicitName: string | null): Promise<Profile | null> => {
  if (lobby.code === null) return refuse('the lobby code is missing (--lobby-join=<host>[:<port>]:<code>)');
  const check = await checkLobby(lobby.server, lobby.code);
  if (check.kind !== 'ok') return refuse(check.kind === 'error' ? check.text : 'the lobby check did not finish');
  const pick = await pickLaunchProfile(active, 'archipelia', explicitName, `RotP-${lobby.code.slice(0, 4)}`);
  if (pick.kind === 'refuse') return refuse(pick.why);
  const profile = pick.kind === 'create' ? await createLobbyProfile(active, pick.name, check) : await joinWithProfile(pick.profile, check);
  if (profile === null) return null;
  return (await waitForRoom(profile.id)) ? profile : null;
};

export { joinLobbyAtLaunch };
