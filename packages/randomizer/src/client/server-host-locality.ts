/* @layer bridge-wasm @kind logic */
import {
  BRACKETED_HOST, DOTTED_QUAD, IPV6_LINK_LOCAL, IPV6_UNIQUE_LOCAL,
} from './server-host-locality.constants';

const isPrivateBlock = (a: number, b: number): boolean =>
  (a === 172 && b >= 16 && b <= 31)
  || (a === 192 && b === 168)
  || (a === 169 && b === 254);

const isLocalIpv4 = (host: string): boolean => {
  const match = DOTTED_QUAD.exec(host);
  if (!match) return false;
  const [, first, second] = match;
  const [a, b] = [Number(first), Number(second)];
  return a === 127 || a === 10 || a === 0 || isPrivateBlock(a, b);
};

const isLocalIpv6 = (host: string): boolean => {
  const lower = host.toLowerCase();
  return lower === '::1' || lower === '::' || IPV6_UNIQUE_LOCAL.test(lower) || IPV6_LINK_LOCAL.test(lower);
};

const isBareIpv6 = (address: string): boolean => (address.match(/:/g) ?? []).length > 1;

const hostOf = (address: string): string => {
  const inBrackets = BRACKETED_HOST.exec(address)?.[1];
  if (inBrackets !== undefined) return inBrackets.toLowerCase();
  if (isBareIpv6(address)) return address.toLowerCase();
  const [beforePort = ''] = address.split(':');
  return beforePort.toLowerCase();
};

const isLocalServerAddress = (address: string): boolean => {
  const [beforePath = ''] = address.split('/');
  const host = hostOf(beforePath);
  if (!host) return false;
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return true;
  if (isLocalIpv4(host) || isLocalIpv6(host)) return true;
  return !host.includes('.') && !host.includes(':');
};

export { isLocalServerAddress };
