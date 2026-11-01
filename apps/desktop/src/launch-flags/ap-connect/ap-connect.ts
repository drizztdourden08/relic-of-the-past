/* @layer renderer-lib @kind logic */
import { log } from '../../log-bus';
import { startupFlag } from '../startup-flag';
import type { ApConnectFlag } from './ap-connect.type';
import { parseApConnect } from './parse-ap-connect';

const apConnectFlag = (): ApConnectFlag => {
  const raw = startupFlag('ap-connect');
  if (raw === undefined) return { kind: 'absent' };
  const parsed = typeof raw === 'string' ? parseApConnect(raw) : null;
  if (parsed?.ok) return { kind: 'set', value: parsed.value };
  log.app(`--ap-connect refused: ${parsed === null ? 'it needs a value' : parsed.error}`, 'error');
  return { kind: 'invalid' };
};

export { apConnectFlag };
