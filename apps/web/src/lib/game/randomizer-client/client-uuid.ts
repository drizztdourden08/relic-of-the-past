/* @layer bridge-wasm @kind logic */
/**
 * The install's client id for Connect. Generated once and kept in localStorage, so a
 * server sees the same client across sessions. When storage is unavailable the id lives
 * for this page only.
 */

const UUID_KEY = 'rotp.ap.uuid';

let memoryUuid: string | null = null;

const freshUuid = (): string => {
  const cryptoApi = (globalThis as { crypto?: Crypto }).crypto;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  return `rotp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

const clientUuid = (): string => {
  try {
    const stored = localStorage.getItem(UUID_KEY);
    if (stored) return stored;
    const next = freshUuid();
    localStorage.setItem(UUID_KEY, next);
    return next;
  } catch {
    memoryUuid ??= freshUuid();
    return memoryUuid;
  }
};

export { clientUuid, UUID_KEY };
