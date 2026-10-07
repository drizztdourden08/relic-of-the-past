/* @layer bridge-wasm @kind logic */
/**
 * Whether a server address names a machine on this computer or its local network. A local
 * Archipelago server answers plain ws:// only, so a secure attempt there can only fail.
 * Local means a loopback address, a private or link-local IPv4 range, an IPv6 loopback,
 * unique-local or link-local address, a `localhost` or `.local` name, or a bare machine name
 * with no dot in it.
 */

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

const isLocalIpv4 = (host: string): boolean => {
  const match = IPV4.exec(host);
  if (!match) return false;
  const [a, b] = [Number(match[1]), Number(match[2])];
  return a === 127 || a === 10 || a === 0
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || (a === 169 && b === 254);
};

const isLocalIpv6 = (host: string): boolean => {
  const lower = host.toLowerCase();
  return lower === '::1' || lower === '::' || /^f[cd][0-9a-f]{2}:/.test(lower) || /^fe[89ab][0-9a-f]:/.test(lower);
};

/** The host part of a bare `host:port`, `[v6]:port` or `host` address, lowercased. */
const hostOf = (address: string): string => {
  const bracketed = /^\[([^\]]+)\]/.exec(address);
  if (bracketed) return bracketed[1].toLowerCase();
  // An unbracketed address with several colons is a bare IPv6 address with no port.
  if ((address.match(/:/g) ?? []).length > 1) return address.toLowerCase();
  return address.split(':')[0].toLowerCase();
};

/** |address| (bare, no scheme) is on this computer or its local network. */
const isLocalServerAddress = (address: string): boolean => {
  const host = hostOf(address.split('/')[0]);
  if (!host) return false;
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return true;
  if (isLocalIpv4(host) || isLocalIpv6(host)) return true;
  return !host.includes('.') && !host.includes(':');
};

export { isLocalServerAddress };
