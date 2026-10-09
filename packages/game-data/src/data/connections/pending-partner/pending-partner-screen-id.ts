/* @layer shared-game @kind logic */
import type { ConnectionId, ScreenId } from '../../types/ids';
import { PENDING_PARTNER_PREFIX } from './pending-partner.constants';

const pendingPartnerScreenId = (id: ConnectionId): ScreenId | null => {
  if (!id.startsWith(PENDING_PARTNER_PREFIX)) return null;
  return id.slice(PENDING_PARTNER_PREFIX.length) as ScreenId;
};

export { pendingPartnerScreenId };
