/* @layer bridge-wasm @kind logic */
import { BRACKETED_HOST, LOOPBACK_ADDRESS, URL_SCHEME } from './is-loopback-server.constants';

const hostOf = (server: string): string => {
  const [authority = ''] = server.trim().replace(URL_SCHEME, '').split('/');
  const bracketed = BRACKETED_HOST.exec(authority)?.[1];
  if (bracketed !== undefined) return bracketed.toLowerCase();
  return (authority.split(':')[0] ?? '').toLowerCase();
};

const isLoopbackServer = (server: string): boolean => {
  const host = hostOf(server);
  return host === 'localhost' || host.endsWith('.localhost') || host === '::1' || LOOPBACK_ADDRESS.test(host);
};

export { isLoopbackServer };
