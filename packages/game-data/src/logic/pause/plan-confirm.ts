/* @layer shared-game @kind logic */
import type { ConfirmPlan, GearLadderKind, PauseContext, PauseState } from './pause.type';
import { ARROW_LADDER, BARE_TIER } from './gear-tiers.constants';
import { confirmTargetAt } from './confirm-target-at';
import { isGearTierSelectable } from './is-gear-tier-selectable';

const markFor = (gear: GearLadderKind, ctx: PauseContext): number =>
  gear === ARROW_LADDER ? (ctx.ownedMax.bow ?? 0) : ctx.ownedMax[gear];

const planConfirm = (state: PauseState, ctx: PauseContext): ConfirmPlan => {
  const target = confirmTargetAt(state, ctx);
  if (!target) return { outcome: 'ignored' };
  if (target.kind === 'exit') return { outcome: 'exit', via: target.via };
  if (target.kind === 'unequip') return { outcome: 'equip', gear: target.gear, tier: BARE_TIER };
  return isGearTierSelectable(target.gear, target.tier, markFor(target.gear, ctx))
    ? { outcome: 'equip', gear: target.gear, tier: target.tier }
    : { outcome: 'refused' };
};

export { planConfirm };
