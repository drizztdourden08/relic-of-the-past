/* @layer bridge-wasm @kind logic */
/**
 * Server address handling. The creation form accepts a bare host:port, and the scheme it
 * needs depends on the host: the public servers only answer wss://, a local server only
 * ws://. So a bare address keeps no scheme here, and the connect path tries each candidate
 * in turn (serverUrlCandidates): secure first, plain second.
 */

const SCHEME = /^wss?:\/\//i;

/** Trims the address. A bare host:port stays bare; the connect path picks its scheme. */
const normalizeServerUrl = (raw: string): string => raw.trim();

/** The URLs to try, in order. An address that names its scheme is tried as written. */
const serverUrlCandidates = (raw: string): string[] => {
  const trimmed = normalizeServerUrl(raw);
  if (!trimmed) return [];
  if (SCHEME.test(trimmed)) return [trimmed];
  return [`wss://${trimmed}`, `ws://${trimmed}`];
};

export { normalizeServerUrl, serverUrlCandidates };
