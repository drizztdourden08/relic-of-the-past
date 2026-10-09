/* @layer bridge-wasm @kind constants */
import type { PondMessageIds } from './receipt-text-refresh';
import type { PondSessionPlan } from './pond-session.type';

const NO_POND_MESSAGES: PondMessageIds = {
  priceMessageOf: () => -1,
  refundMessageOf: () => -1,
  awardMoreMessageId: -1,
  awardLastMessageId: -1,
  closedMessageId: -1,
};

const LEGACY_POND_SESSION: PondSessionPlan = {
  throws: [], armed: false, prizeCount: 0, awardMoreMessageId: -1, awardLastMessageId: -1, closedMessageId: -1,
};

export { LEGACY_POND_SESSION, NO_POND_MESSAGES };
