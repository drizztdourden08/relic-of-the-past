/* @layer renderer-lib @kind logic */
import { log } from '../../log-bus';
import { startupFlag } from '../startup-flag';
import type { LobbyJoinFlag } from './lobby-join.type';
import { parseLobbyJoin } from './parse-lobby-join';

const lobbyJoinFlag = (): LobbyJoinFlag => {
  const raw = startupFlag('lobby-join');
  if (raw === undefined) return { kind: 'absent' };
  const parsed = typeof raw === 'string' ? parseLobbyJoin(raw) : null;
  if (parsed?.ok) return { kind: 'set', value: parsed.value };
  log.app(`--lobby-join refused: ${parsed === null ? 'it needs a value' : parsed.error}`, 'error');
  return { kind: 'invalid' };
};

export { lobbyJoinFlag };
