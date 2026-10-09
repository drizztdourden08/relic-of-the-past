/* @layer bridge-wasm @kind logic */
import type { LocationKey } from '../world/location-key';
import { getCheck } from '@rotp/game-data';
import { pondPlanOf } from '../world/pond/pond-plan';
import { WISH_POND_WATERS } from './wish-pond-rung-keys.constants';
import type { CheckId } from '@rotp/game-data';
import type { Placement } from '../world/fill/placement.type';
import type { PondInstance } from '../world/pond/pond-instance.type';
import type { PhysicalPlan, PlanEntry } from './physical-plan.type';
import type {
  PendingRung, RungGrant, WishPondArmContext, WishPondRungRow, WishPondSessionPlan, WishPondWaterPlan,
} from './wish-pond-rungs.type';

const vanillaSlotGrant = (entry: PlanEntry | undefined, location: LocationKey): RungGrant | string => {
  if (entry?.planClass !== 'override-npc' || entry.npcOverride === undefined || entry.checkId === undefined) {
    return `"${location}" has no npc override armed, so a vanilla grant there would pay nothing`;
  }
  const { itemId } = getCheck(entry.checkId).gameId;
  if (itemId === undefined || itemId !== entry.npcOverride.vanillaItemId) {
    return `"${location}" has no vanilla receive id matching its npc override`;
  }
  return { item: entry.item, newItem: itemId, messageId: -1, assigned: false };
};

const customGrant = (
  entry: PlanEntry | undefined, location: LocationKey, messageIdOf: WishPondArmContext['messageIdOf'],
): RungGrant | string => {
  const target = entry?.scriptedOverride?.target;
  if (entry?.scriptedOverride === undefined || target?.surface !== 'wish-pond') {
    return `"${location}" is not classified as a wish-pond rung`;
  }
  return {
    item: entry.item, newItem: entry.scriptedOverride.targetLocalId,
    messageId: messageIdOf(location), assigned: true,
  };
};

const waterPlanOf = (
  instance: PondInstance, pond: number, placement: Placement,
  byLocation: ReadonlyMap<string, PlanEntry>, context: WishPondArmContext,
): WishPondWaterPlan => {
  const { messageIdOf, fireIdOf, lines } = context;
  const setting = placement.stats.ponds[instance.id];
  const base = { id: instance.id, label: instance.label, pond, mode: setting.mode, lines };
  if (setting.mode === 'capacity') return { ...base, rungs: [] };
  const pending: PendingRung[] = [];
  for (const [rung, location] of pondPlanOf(setting, instance).locations.entries()) {
    const entry = byLocation.get(location);
    const grant = setting.mode === 'vanilla-cost'
      ? vanillaSlotGrant(entry, location)
      : customGrant(entry, location, messageIdOf);
    if (typeof grant === 'string') return { ...base, rungs: [], refusal: grant };
    pending.push({ ...grant, pond, rung, location });
  }
  const rungs = pending.map((row): WishPondRungRow =>
    ({ ...row, fireId: row.assigned ? fireIdOf(row.location) : -1 }));
  return { ...base, rungs };
};

const wishPondSessionOf = (
  placement: Placement, plan: PhysicalPlan, context: WishPondArmContext,
): WishPondSessionPlan => {
  const byLocation = new Map(plan.entries.map((entry) => [entry.location, entry]));
  const waters = WISH_POND_WATERS.map(({ instance, pond }) =>
    waterPlanOf(instance, pond, placement, byLocation, context));
  const rungs = waters.flatMap((water) => water.rungs.map(({ pond, rung, newItem, messageId, fireId, assigned }) =>
    ({ pond, rung, newItem, messageId, fireId, assigned })));
  return { waters, rungs };
};

export { wishPondSessionOf };
export type {
  WishPondArmContext, WishPondRungRow, WishPondSessionPlan, WishPondWaterPlan,
} from './wish-pond-rungs.type';
