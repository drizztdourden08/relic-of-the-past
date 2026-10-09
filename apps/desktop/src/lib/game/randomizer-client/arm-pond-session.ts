/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { setPondAwardMessage, setPondClosedMessage, setPondThrows } from '../pond-plan';
import type { PondSessionPlan } from '@rotp/randomizer';

const armPondSession = (plan: PondSessionPlan, tag: string): void => {
  if (!plan.armed) {
    log.randomizer(`${tag} Pond: the native purchase loop, core not armed`);
    return;
  }
  setPondThrows(plan.throws);
  setPondAwardMessage(plan.awardMoreMessageId, plan.awardLastMessageId);
  setPondClosedMessage(plan.closedMessageId);
  const prizeAt = plan.throws.flatMap((entry, index) => (entry.prize >= 0 ? [index] : []));
  const spoken = plan.throws.filter((entry) => entry.prompt >= 0).length;
  log.randomizer(`${tag} Pond armed: ${plan.throws.length} throws, `
    + `${plan.prizeCount} prizes at throws [${prizeAt.join(', ')}], `
    + `${plan.throws.reduce((sum, entry) => sum + entry.price, 0)} rupees to empty, `
    + `${spoken} of them announcing their own price`);
};

export { armPondSession };
