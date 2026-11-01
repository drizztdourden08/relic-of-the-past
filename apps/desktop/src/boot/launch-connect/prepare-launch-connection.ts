/* @layer renderer-app @kind logic */
import { log } from '@app/log-bus';
import { apConnectFlag } from '@app/launch-flags/ap-connect/ap-connect';
import { lobbyJoinFlag } from '@app/launch-flags/lobby-join/lobby-join';
import { applyApConnect } from './apply-ap-connect';
import { joinLobbyAtLaunch } from './join-lobby-at-launch';

/** Runs --ap-connect or --lobby-join against the profile before its game loads; false means the launch must not go on. */
const prepareLaunchConnection = async (profile: Profile): Promise<boolean> => {
  const connect = apConnectFlag();
  const lobby = lobbyJoinFlag();
  if (connect.kind === 'invalid' || lobby.kind === 'invalid') return false;
  if (connect.kind === 'set' && lobby.kind === 'set') {
    log.app('--ap-connect and --lobby-join cannot be combined: pick one', 'error');
    return false;
  }
  if (connect.kind === 'set') return applyApConnect(profile, connect.value);
  if (lobby.kind === 'set') return joinLobbyAtLaunch(profile, lobby.value);
  return true;
};

export { prepareLaunchConnection };
