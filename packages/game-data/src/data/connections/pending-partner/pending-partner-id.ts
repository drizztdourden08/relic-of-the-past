/* @layer shared-game @kind logic */
import type { ConnectionId, ScreenId } from '../../types/ids';
import { PENDING_PARTNER_PREFIX } from './pending-partner.constants';

const pendingPartnerId = (screenId: ScreenId): ConnectionId => `${PENDING_PARTNER_PREFIX}${screenId}`;

export { pendingPartnerId };
