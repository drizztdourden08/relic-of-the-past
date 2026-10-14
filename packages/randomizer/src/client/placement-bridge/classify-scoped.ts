/* @layer bridge-wasm @kind logic */
import { pondPrizeTargetOf } from '../pond-prize-target';
import { shopOverrideKeyOf } from '../shop-override-key';
import type { PlanEntry } from '../physical-plan.type';
import type { ScopedContext } from './classify-location.type';

const classifyScoped = (ctx: ScopedContext): PlanEntry | null => {
  const { location, item, flags, targetLocalId, checkId, detectionField } = ctx;
  const shopKey = shopOverrideKeyOf(location, flags.shops, flags.shopPrices);
  if (shopKey !== null) {
    return {
      location, item, planClass: 'override-shop', ...detectionField,
      shopOverride: { ...shopKey, targetLocalId },
    };
  }
  const pondTarget = pondPrizeTargetOf(location, flags);
  if (pondTarget !== null) {
    return {
      location, item, planClass: 'override-scripted',
      ...(checkId !== undefined ? { checkId } : {}),
      scriptedOverride: { target: pondTarget, targetLocalId },
    };
  }
  return null;
};

export { classifyScoped };
