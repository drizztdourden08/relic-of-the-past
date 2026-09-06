/* @layer bridge-wasm @kind logic */
/**
 * Pond arming for a session — turns the pond setting a placement was generated
 * with into the core's throw table. The throw schedule is NOT stored on the
 * placement: it is re-derived from the setting and the placement's own seed
 * (pondPlanOf), so the spoiler, the logic and the running game always read the
 * same prices and the same winning throws. The translation is pure
 * (pondSessionOf) so a test can pin it without a module; arming and disarming
 * are the only impure steps.
 *
 * Each row also carries the two pre-rendered lines that belong to its amounts
 * — the price the toss announces, and the consolation a losing throw pays —
 * looked up by amount in the session's composed pool (pond-lines.ts). The
 * emptied-pond line is armed once alongside them. A composition that was
 * refused hands back -1 for every line, which the core reads as "keep the
 * native one", so the pond still runs its plan with the game's own wording.
 *
 * A legacy pond arms nothing at all: the table stays empty, the gate bit stays
 * down, and the pond's own handler runs exactly as it always has.
 */

import { pondPlanOf } from '@shared/randomizer/ap-world/pond/pond-plan';
import { log } from '../../log-bus';
import { clearPondPlan, setPondClosedMessage, setPondThrows } from '../pond-plan';
import type { ApPlacement } from '@shared/randomizer/ap-world/fill/ap-placement.type';
import type { PondThrowArm } from '../pond-plan';
import type { PondMessageIds } from './receipt-text-refresh';

/** No composed pool at all — every pond line keeps the game's native wording. */
const NO_POND_MESSAGES: PondMessageIds = {
  priceMessageOf: () => -1,
  refundMessageOf: () => -1,
  closedMessageId: -1,
};

interface PondSessionPlan {
  /** One row per throw, in the order the pond sells them; [] for a legacy pond. */
  throws: readonly PondThrowArm[];
  /** True when the core has anything to arm. */
  armed: boolean;
  /** Prize slots the plan carries — the pond locations of this placement. */
  prizeCount: number;
  /** The line an emptied pond shows, or -1 to keep the native refusal. */
  closedMessageId: number;
}

const pondSessionOf = (placement: ApPlacement, messages: PondMessageIds = NO_POND_MESSAGES): PondSessionPlan => {
  const setting = placement.stats.pond;
  if (setting === undefined || setting.mode === 'capacity') {
    return { throws: [], armed: false, prizeCount: 0, closedMessageId: -1 };
  }
  const plan = pondPlanOf(setting, placement.seed);
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
    closedMessageId: messages.closedMessageId,
  };
};

const armPondSession = (plan: PondSessionPlan, tag: string): void => {
  if (!plan.armed) {
    log.randomizer(`${tag} Pond: the native purchase loop, core not armed`);
    return;
  }
  setPondThrows(plan.throws);
  setPondClosedMessage(plan.closedMessageId);
  const prizeAt = plan.throws.flatMap((entry, index) => (entry.prize >= 0 ? [index] : []));
  const spoken = plan.throws.filter((entry) => entry.prompt >= 0).length;
  log.randomizer(`${tag} Pond armed: ${plan.throws.length} throws, `
    + `${plan.prizeCount} prizes at throws [${prizeAt.join(', ')}], `
    + `${plan.throws.reduce((sum, entry) => sum + entry.price, 0)} rupees to empty, `
    + `${spoken} of them announcing their own price`);
};

const disarmPondSession = (): void => {
  clearPondPlan();
};

export { armPondSession, disarmPondSession, pondSessionOf };
export type { PondSessionPlan };
