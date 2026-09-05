/* @layer shared-game @kind logic */
/**
 * A connection point can only be proposed once its partner is known (every
 * `ConnectionRecord.toConnectionId` is required, never optional, as
 * `data/types/connection.ts` says). When the destination screen already holds a
 * point aimed back at this one, that partner's real id is used directly. When
 * it does not, for a brand-new crossing nothing has registered yet, there is no
 * real id to give. Minting one needs the allocator round trip only the write
 * path can do (`withAllocatedIds`), which a renderer-side proposal builder
 * cannot reach on its own.
 *
 * This sentinel carries the one fact the write path needs to finish the job:
 * which screen the still-unminted partner belongs on. It is shaped like a
 * `ConnectionId` (so it can sit in a `toConnectionId` field without widening
 * that field's type) but is never a real one and must never reach disk. The
 * create writer (`record-creators.ts`'s `createConnection`) always checks for
 * it before treating `toConnectionId` as an id to resolve, and mints the whole
 * pair instead.
 */
import type { ConnectionId, ScreenId } from '../types/ids';

const PENDING_PARTNER_PREFIX = 'connection-pending:';

/** A `toConnectionId` placeholder naming the screen the missing partner belongs on. */
const pendingPartnerId = (screenId: ScreenId): ConnectionId => `${PENDING_PARTNER_PREFIX}${screenId}`;

/** The screen a pending sentinel names, or null for an id that resolves normally. */
const pendingPartnerScreenId = (id: ConnectionId): ScreenId | null => {
  if (!id.startsWith(PENDING_PARTNER_PREFIX)) return null;
  return id.slice(PENDING_PARTNER_PREFIX.length) as ScreenId;
};

export { pendingPartnerId, pendingPartnerScreenId };
