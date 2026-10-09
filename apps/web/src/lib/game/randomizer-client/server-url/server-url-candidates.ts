/* @layer bridge-wasm @kind logic */
import { isLocalServerAddress } from '../server-host-locality';
import { normalizeServerUrl } from './normalize-server-url';
import { SCHEME } from './server-url.constants';

const serverUrlCandidates = (raw: string): string[] => {
  const trimmed = normalizeServerUrl(raw);
  if (!trimmed) return [];
  if (SCHEME.test(trimmed)) return [trimmed];
  if (isLocalServerAddress(trimmed)) return [`ws://${trimmed}`];
  return [`wss://${trimmed}`, `ws://${trimmed}`];
};

export { serverUrlCandidates };
