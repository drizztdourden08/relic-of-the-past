/* @layer renderer-widgets @kind logic */
import type { SlotSpec, TierOption } from '../ItemsTab.type';

const givableTier = (spec: SlotSpec): TierOption | undefined =>
  spec.tiers.find((tier) => tier.value > 0 && tier.receiveItemId !== undefined);

export { givableTier };
