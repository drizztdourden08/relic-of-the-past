/* @layer bridge-wasm @kind logic */
import { UUID_KEY } from './client-uuid.constants';
import type { PageOnlyUuidState } from './client-uuid.type';

const pageOnlyUuid: PageOnlyUuidState = { uuid: null };

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
    pageOnlyUuid.uuid ??= freshUuid();
    return pageOnlyUuid.uuid;
  }
};

export { clientUuid };
