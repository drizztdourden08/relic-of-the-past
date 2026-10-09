/* @layer bridge-wasm @kind logic */
import { PORT_TAIL } from './server-address.constants';
import type { ServerAddress } from './server-address.type';

const splitServerAddress = (raw: string): ServerAddress => {
  const trimmed = raw.trim();
  const match = PORT_TAIL.exec(trimmed);
  if (match === null) return { host: trimmed, port: '' };
  return { host: match[1], port: match[2] };
};

export { splitServerAddress };
