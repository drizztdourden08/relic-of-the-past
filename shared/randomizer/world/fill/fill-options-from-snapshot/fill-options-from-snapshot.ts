/* @layer shared-game @kind logic */
import { VANILLA_MEDALLIONS } from '../../item-groups';
import { EMPTY_DELIVERABLE } from '../fill.constants';
import { fillFlagsOf } from './fill-flags-of';
import type { RandomizerOptionsSnapshot } from '../../options.type';
import type { FillWorldOptions } from '../fill-world.type';
import type { DeliverableSets, FillPickers } from '../fill.type';

const fillOptionsFromSnapshot = (
  snapshot: RandomizerOptionsSnapshot, deliverable: DeliverableSets, pickers: FillPickers = {}, seed = '',
): FillWorldOptions => ({
  ...fillFlagsOf(snapshot, seed),
  deliverableNpcLocations: deliverable.npc ?? EMPTY_DELIVERABLE,
  deliverableWorldLocations: deliverable.world ?? EMPTY_DELIVERABLE,
  deliverableCapacityLocations: deliverable.capacity ?? EMPTY_DELIVERABLE,
  medallions: { ...VANILLA_MEDALLIONS },
  ...pickers,
});

export { fillOptionsFromSnapshot };
