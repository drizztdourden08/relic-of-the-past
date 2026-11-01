/* @layer renderer-app @kind logic */
import { log } from '@app/log-bus';
import { apConnectFlag } from '@app/launch-flags/ap-connect/ap-connect';
import { lobbyJoinFlag } from '@app/launch-flags/lobby-join/lobby-join';
import { profileNameFlag } from '@app/launch-flags/profile-name/profile-name';
import { listProfiles } from '@app/storage/profile-store';
import { applyApConnect } from './apply-ap-connect';
import { joinLobbyAtLaunch } from './join-lobby-at-launch';

const namedProfile = async (name: string): Promise<Profile | null> => {
  const found = (await listProfiles()).find((profile) => profile.name === name);
  if (found === undefined) log.app(`--profile-name refused: there is no profile called "${name}"`, 'error');
  return found ?? null;
};

const prepareLaunchConnection = async (active: Profile): Promise<Profile | null> => {
  const connect = apConnectFlag();
  const lobby = lobbyJoinFlag();
  const name = profileNameFlag();
  if (connect.kind === 'invalid' || lobby.kind === 'invalid') return null;
  if (connect.kind === 'set' && lobby.kind === 'set') {
    log.app('--ap-connect and --lobby-join cannot be combined: pick one', 'error');
    return null;
  }
  if (connect.kind === 'set') return applyApConnect(active, connect.value, name);
  if (lobby.kind === 'set') return joinLobbyAtLaunch(active, lobby.value, name);
  return name === null || name === active.name ? active : namedProfile(name);
};

export { prepareLaunchConnection };
