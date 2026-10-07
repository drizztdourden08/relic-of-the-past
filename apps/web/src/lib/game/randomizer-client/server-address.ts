/* @layer bridge-wasm @kind logic */
/**
 * A profile's server address as the two fields the connection form edits. The profile keeps
 * one `host:port` string, the shape the connect path reads (server-url.ts); a scheme the
 * address names stays on the host.
 */

interface ServerAddress {
  host: string;
  port: string;
}

const PORT_TAIL = /^(.*):(\d*)$/;
const MAX_PORT = 65535;

/** `wss://host:38281` to { host: 'wss://host', port: '38281' }. No port, an empty one. */
const splitServerAddress = (raw: string): ServerAddress => {
  const trimmed = raw.trim();
  const match = PORT_TAIL.exec(trimmed);
  if (match === null) return { host: trimmed, port: '' };
  return { host: match[1], port: match[2] };
};

const joinServerAddress = ({ host, port }: ServerAddress): string => `${host.trim()}:${port.trim()}`;

/** Why the address cannot be saved, or null when it can. */
const serverAddressError = ({ host, port }: ServerAddress): string | null => {
  if (host.trim() === '') return 'Enter a host.';
  const value = Number(port.trim());
  if (!/^\d+$/.test(port.trim()) || value < 1 || value > MAX_PORT) return `Port is 1 to ${MAX_PORT}.`;
  return null;
};

export { joinServerAddress, serverAddressError, splitServerAddress };
export type { ServerAddress };
