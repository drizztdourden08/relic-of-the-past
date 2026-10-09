/* @layer bridge-wasm @kind logic */
import { deliverableSetsOf, parseDeliverableLists } from '../../world/fill/deliverable-lists';
import type { DeliverableSets } from '../../world/fill/fill-options-from-snapshot';
import type { RotpSlotData } from '../../archipelago/slot-data.type';

const preRolledDeliverable = (slotData: RotpSlotData): Required<DeliverableSets> | undefined => {
  const lists = parseDeliverableLists(slotData.preRolled?.deliverable);
  return lists === undefined ? undefined : deliverableSetsOf(lists);
};

export { preRolledDeliverable };
