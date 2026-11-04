/* @layer renderer-app @kind logic */
import type { DeliveryAction, Placement } from '@rotp/randomizer';
import type { SeedApplier } from '@drizztdourden08/brock-randomizer/session';
import { armSessionFromPlacement } from '@app/game/randomizer-client/session-start';
import { disarmSession } from '@app/game/randomizer-client/session-stop';
import { armedSeedOf } from './armed-seed-of';

const rotpApplier: SeedApplier<Placement, DeliveryAction> = {
  apply: async (placement, ctx) => {
    const armed = await armSessionFromPlacement(placement, ctx.tag, { reporter: ctx });
    if (!armed.ok) {
      return { ok: false, refusal: `${armed.plan.errors.length} plan errors`, counts: { ...armed.plan.counts } };
    }
    return { ok: true, armed: armedSeedOf(armed) };
  },
  revert: disarmSession,
};

export { rotpApplier };
