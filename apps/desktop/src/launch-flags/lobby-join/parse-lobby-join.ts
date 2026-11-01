/* @layer renderer-lib @kind logic */
import { formatLobbyCode } from '@rotp/randomizer';
import type { LobbyJoinParse } from './lobby-join.type';
import { LOBBY_JOIN_SHAPE } from './lobby-join.constants';

const fail = (error: string): LobbyJoinParse => ({ ok: false, error: `${error} (expected ${LOBBY_JOIN_SHAPE})` });

const parseLobbyJoin = (raw: string): LobbyJoinParse => {
  const parts = raw.split(':');
  const last = parts.length > 1 ? parts[parts.length - 1] ?? '' : '';
  const code = formatLobbyCode(last);
  const addressParts = code === null ? parts : parts.slice(0, -1);
  const host = addressParts[0]?.trim() ?? '';
  const port = addressParts[1] ?? '';
  if (host === '') return fail('the address is empty');
  if (addressParts.length > 2) return fail('the address has too many parts');
  if (addressParts.length === 2 && !/^\d{1,5}$/.test(port)) return fail(`"${port}" is neither a port nor a lobby code`);
  return { ok: true, value: { server: addressParts.join(':'), code } };
};

export { parseLobbyJoin };
