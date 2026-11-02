/* @layer renderer-app @kind logic */
import { logLobbyJoinRefused } from '@app/game/event-log';
import { log } from '@app/log-bus';

const refuseLobbyJoin = (why: string, code?: string): null => {
  log.app(`--lobby-join refused: ${why}`, 'error');
  logLobbyJoinRefused(why, code);
  return null;
};

export { refuseLobbyJoin };
