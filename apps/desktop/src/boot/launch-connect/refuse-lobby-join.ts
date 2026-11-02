/* @layer renderer-app @kind logic */
import { logLobbyJoinRefused } from '@app/game/event-log';
import { log } from '@app/log-bus';

const refuseLobbyJoin = (why: string): null => {
  log.app(`--lobby-join refused: ${why}`, 'error');
  logLobbyJoinRefused(why);
  return null;
};

export { refuseLobbyJoin };
