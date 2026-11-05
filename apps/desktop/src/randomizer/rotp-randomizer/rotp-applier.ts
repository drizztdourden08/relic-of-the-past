/* @layer renderer-app @kind logic */
import { scoutedTextsState } from '@rotp/randomizer';
import type { DeliveryAction, Placement } from '@rotp/randomizer';
import type { SeedApplier } from '@drizztdourden08/brock-randomizer/session';
import { logLocalArmed } from '@app/game/randomizer-client/local-armed-log';
import { localStats } from '@app/game/randomizer-client/session-store/local-stats';
import { suppressSink } from '@app/game/randomizer-client/location-poller';
import { armSessionFromPlacement } from '@app/game/randomizer-client/session-start';
import { disarmSession } from '@app/game/randomizer-client/session-stop';
import { armedSeedOf } from './armed-seed-of';
import { rotpApForeignHooks } from './rotp-ap-foreign';
import { rotpApServerGrants } from './rotp-ap-server-grants';

const rotpApplier: SeedApplier<Placement, DeliveryAction> = {
  apply: async (placement, ctx) => {
    const foreign = await rotpApForeignHooks(placement, ctx);
    const armed = await armSessionFromPlacement(placement, ctx.tag, { reporter: ctx, ...foreign });
    if (!armed.ok) {
      return { ok: false, refusal: `${armed.plan.errors.length} plan errors`, counts: { ...armed.plan.counts } };
    }
    suppressSink.current = ctx.suppress;
    const seed = armedSeedOf(armed);
    if (ctx.foreign === undefined) {
      localStats.current = armed.plan.counts;
      logLocalArmed(armed.plan.counts);
      return { ok: true, armed: seed };
    }
    scoutedTextsState.active = armed.receiptTexts;
    return { ok: true, armed: { ...seed, serverGrants: rotpApServerGrants(armed.plan) } };
  },
  revert: disarmSession,
};

export { rotpApplier };
