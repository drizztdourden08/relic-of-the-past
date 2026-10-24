/* @layer bridge-wasm @kind logic */
import { DEFAULT_PORT, LOBBY_PATH } from '@archipelia/lobby-protocol';
import { serverUrlCandidates } from '../../server-url';
import { splitServerAddress } from '../../server-address';
import { BARE_ORIGIN, HAS_SCHEME } from './lobby-url.constants';

const withPort = (raw: string): string => {
  const { host, port } = splitServerAddress(raw);
  return port === '' ? `${host}:${DEFAULT_PORT}` : raw;
};

const withPath = (url: string): string => {
  const origin = BARE_ORIGIN.exec(url)?.[1];
  return origin === undefined ? url : `${origin}${LOBBY_PATH}`;
};

const lobbyUrlCandidates = (server: string): string[] => {
  const trimmed = server.trim();
  if (trimmed === '') return [];
  const address = HAS_SCHEME.test(trimmed) ? trimmed : withPort(trimmed);
  return serverUrlCandidates(address).map(withPath);
};

export { lobbyUrlCandidates };
