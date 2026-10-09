/* @layer shared-store @kind logic */
import { STORE_LIMITS } from '../limits';
import { DAY_MS } from './version-flow.constants';
import type { ExpiryVersion } from './version-flow.type';

const fileExpiresAt = (version: ExpiryVersion): number | null => {
  if (version.removed) return null;
  const { state, decidedAt } = version.review;
  if (state === 'rejected') return (decidedAt ?? version.createdAt) + STORE_LIMITS.rejectedKeepDays * DAY_MS;
  if (state === 'ready') return version.createdAt + STORE_LIMITS.readyKeepDays * DAY_MS;
  return null;
};

export { fileExpiresAt };
