/* @layer renderer-lib @kind logic */
import { formatLobbyCode } from '@drizztdourden08/brock-randomizer/archipelago';
import type { LobbyJoinParse } from './lobby-join.type';
import { LOBBY_JOIN_SHAPE } from './lobby-join.constants';

const fail = (error: string): LobbyJoinParse => ({ ok: false, error: `${error} (expected ${LOBBY_JOIN_SHAPE})` });

const addressError = (addressParts: readonly string[]): string | null => {
  const host = addressParts[0]?.trim() ?? '';
  const port = addressParts[1] ?? '';
  if (host === '') return 'the address is empty';
  if (addressParts.length > 2) return 'the address has too many parts';
  if (addressParts.length === 2 && !/^\d{1,5}$/.test(port)) return `"${port}" is neither a port nor a lobby code`;
  return null;
};

const parseLobbyJoin = (raw: string): LobbyJoinParse => {
  const parts = raw.split(':');
  const last = parts.length > 1 ? parts[parts.length - 1] ?? '' : '';
  const code = formatLobbyCode(last);
  const addressParts = code === null ? parts : parts.slice(0, -1);
  const error = addressError(addressParts);
  if (error !== null) return fail(error);
  return { ok: true, value: { server: addressParts.join(':'), code } };
};

export { parseLobbyJoin };
