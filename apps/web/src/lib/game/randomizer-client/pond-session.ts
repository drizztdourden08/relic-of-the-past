/* @layer bridge-wasm @kind logic */
import { pondPlanOf } from '@shared/randomizer/world/pond/pond-plan';
import { LEGACY_POND_SESSION, NO_POND_MESSAGES } from './pond-session.constants';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { PondThrowArm } from '../pond-plan';
import type { PondMessageIds } from './receipt-text-refresh';
import type { PondSessionPlan } from './pond-session.type';

const pondSessionOf = (placement: Placement, messages: PondMessageIds = NO_POND_MESSAGES): PondSessionPlan => {
  const coreArmedPond = placement.stats.ponds.capacity;
  if (coreArmedPond.mode === 'capacity') return { ...LEGACY_POND_SESSION };
  const plan = pondPlanOf(coreArmedPond);
  const throws = plan.throws.map((entry): PondThrowArm => ({
    price: entry.price,
    prize: entry.prize,
    refund: entry.refund,
    prompt: messages.priceMessageOf(entry.price),
    consolation: entry.refund > 0 ? messages.refundMessageOf(entry.refund) : -1,
  }));
  return {
    throws,
    armed: throws.length > 0,
    prizeCount: plan.locations.length,
    awardMoreMessageId: messages.awardMoreMessageId,
    awardLastMessageId: messages.awardLastMessageId,
    closedMessageId: messages.closedMessageId,
  };
};

export { pondSessionOf };
export type { PondSessionPlan } from './pond-session.type';
