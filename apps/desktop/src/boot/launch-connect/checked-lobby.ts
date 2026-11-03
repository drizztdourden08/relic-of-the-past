/* @layer renderer-app @kind logic */
import { checkLobby } from '@app/game/archipelia';
import type { LobbyCheckOk } from '@app/game/archipelia';
import { refuseLobbyJoin as refuse } from './refuse-lobby-join';

const checkedLobby = async (server: string, code: string): Promise<LobbyCheckOk | null> => {
  const check = await checkLobby(server, { code });
  if (check.kind === 'error') return refuse(check.text, check.code);
  if (check.kind !== 'ok') return refuse('the lobby check did not finish');
  return check;
};

export { checkedLobby };
