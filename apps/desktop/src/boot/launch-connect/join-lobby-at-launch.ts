/* @layer renderer-app @kind logic */
import { checkLobby, joinFromForm, lobbyWatch, writeMembership } from '@app/game/archipelia';
import { log } from '@app/log-bus';
import type { LobbyJoin } from '@app/launch-flags/lobby-join/lobby-join.type';
import { waitForRoom } from './wait-for-room';

const joinLobbyAtLaunch = async (profile: Profile, lobby: LobbyJoin): Promise<boolean> => {
  const config = profile.randomizer;
  if (config?.mode !== 'archipelia') {
    log.app(`--lobby-join refused: profile "${profile.name}" is not an Archipelia profile`, 'error');
    return false;
  }
  if (lobby.code === null) {
    log.app('--lobby-join refused: the lobby code is missing (--lobby-join=<host>[:<port>]:<code>)', 'error');
    return false;
  }
  const check = await checkLobby(lobby.server, lobby.code);
  if (check.kind !== 'ok') {
    log.app(`--lobby-join refused: ${check.kind === 'error' ? check.text : 'the lobby check did not finish'}`, 'error');
    return false;
  }
  const joined = await joinFromForm(check, config, () => undefined);
  if (!joined.ok) {
    log.app(`--lobby-join refused: ${joined.error}`, 'error');
    return false;
  }
  await writeMembership(profile.id, joined.membership);
  lobbyWatch.adopt(profile.id, joined.session, joined.membership);
  log.app(`[LaunchConnect] Joined lobby "${check.name}" as profile "${profile.name}"`);
  return waitForRoom(profile.id);
};

export { joinLobbyAtLaunch };
