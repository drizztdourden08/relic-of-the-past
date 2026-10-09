/* @layer bridge-wasm @kind logic */
import {
  BRACKETED_HOST, DOTTED_QUAD, IPV6_LINK_LOCAL, IPV6_UNIQUE_LOCAL,
} from './server-host-locality.constants';

const isLocalIpv4 = (host: string): boolean => {
  const match = DOTTED_QUAD.exec(host);
  if (!match) return false;
  const [a, b] = [Number(match[1]), Number(match[2])];
  return a === 127 || a === 10 || a === 0
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || (a === 169 && b === 254);
};

const isLocalIpv6 = (host: string): boolean => {
  const lower = host.toLowerCase();
  return lower === '::1' || lower === '::' || IPV6_UNIQUE_LOCAL.test(lower) || IPV6_LINK_LOCAL.test(lower);
};

const isBareIpv6 = (address: string): boolean => (address.match(/:/g) ?? []).length > 1;

const hostOf = (address: string): string => {
  const bracketed = BRACKETED_HOST.exec(address);
  if (bracketed) return bracketed[1].toLowerCase();
  if (isBareIpv6(address)) return address.toLowerCase();
  return address.split(':')[0].toLowerCase();
};

const isLocalServerAddress = (address: string): boolean => {
  const host = hostOf(address.split('/')[0]);
  if (!host) return false;
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return true;
  if (isLocalIpv4(host) || isLocalIpv6(host)) return true;
  return !host.includes('.') && !host.includes(':');
};

export { isLocalServerAddress };
