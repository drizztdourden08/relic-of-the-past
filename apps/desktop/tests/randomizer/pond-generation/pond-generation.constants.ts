/* @layer tests @kind constants */
import { POND_CERTIFIED_SPOTS, POND_INSTANCES, NPC_SCOPE_LOCATIONS } from '@rotp/randomizer';
import type { LocationKey, OptionValue } from '@rotp/randomizer';

const DELIVERABLE = new Set(POND_CERTIFIED_SPOTS);
const EMPTY: ReadonlySet<LocationKey> = new Set();

const ALL_POND_SLOTS = new Set(POND_INSTANCES.flatMap((pond) => pond.slots.map((slot) => slot.key)));
const ALL_NPC = new Set(NPC_SCOPE_LOCATIONS.keys());

const SEEDS = Array.from({ length: 40 }, (_, index) => `pond-${index}`);

const MODES = ['vanilla-cost', 'custom'] as const;

const MIXED_ASK: Record<string, OptionValue> = {
  pond_capacity_mode: 'custom', pond_capacity_items: 6, pond_capacity_throws: 8,
  pond_capacity_start: '25', pond_capacity_max: '999',
  pond_capacity_ask_rupees: true,
  pond_capacity_ask_bombs: true, pond_capacity_ask_bombs_min: '1', pond_capacity_ask_bombs_max: '10',
  pond_capacity_ask_arrows: true, pond_capacity_ask_arrows_min: '1', pond_capacity_ask_arrows_max: '30',
  pond_capacity_ask_bottle: true, pond_capacity_ask_bottle_min: '1', pond_capacity_ask_bottle_max: '3',
  pond_capacity_ask_item: true,
  pond_wishing_mode: 'capacity', pond_cursed_mode: 'capacity',
};

export { ALL_NPC, ALL_POND_SLOTS, DELIVERABLE, EMPTY, MIXED_ASK, MODES, SEEDS };
