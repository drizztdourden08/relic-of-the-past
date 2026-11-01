/* @layer renderer-lib @kind logic */
import type { ApConnectParse } from './ap-connect.type';
import { AP_CONNECT_SHAPE, MAX_PORT } from './ap-connect.constants';

const fail = (error: string): ApConnectParse => ({ ok: false, error: `${error} (expected ${AP_CONNECT_SHAPE})` });

const parseApConnect = (raw: string): ApConnectParse => {
  const [host = '', port = '', slot = '', ...rest] = raw.split(':');
  if (host.trim() === '') return fail('the host is empty');
  if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > MAX_PORT) return fail(`"${port}" is not a port`);
  if (slot.trim() === '') return fail('the slot name is empty');
  const password = rest.join(':');
  return { ok: true, value: { host: host.trim(), port, slot: slot.trim(), password: password === '' ? null : password } };
};

export { parseApConnect };
