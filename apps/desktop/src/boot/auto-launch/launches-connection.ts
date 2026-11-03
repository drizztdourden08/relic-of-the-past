/* @layer renderer-app @kind logic */
import { apConnectFlag } from '@app/launch-flags/ap-connect/ap-connect';
import { lobbyJoinFlag } from '@app/launch-flags/lobby-join/lobby-join';

const launchesConnection = (): boolean => apConnectFlag().kind !== 'absent' || lobbyJoinFlag().kind !== 'absent';

export { launchesConnection };
