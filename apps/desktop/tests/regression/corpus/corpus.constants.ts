/* @layer test @kind constants */
import { generatePlacement, buildOptionsSnapshot, POND_INSTANCES, pondCertifiedSpotsOf, SHOP_MODE_KEY, SHOP_SLOT_ROWS } from '@rotp/randomizer';
import type { Placement, OptionValue, LocationKey } from '@rotp/randomizer';
import { REPO_ROOT } from '../../repo-root';

const ROOT = REPO_ROOT;
const NONE: ReadonlySet<LocationKey> = new Set();
const DELIVERABLE_NPC_SPOTS = new Set<LocationKey>(['check-019', 'check-033', 'check-060', 'check-121']);
const DELIVERABLE_WORLD_SPOTS = new Set<LocationKey>(['check-055', 'check-080', 'check-126', 'check-009']);
const EVERY_SHOP_SLOT: Record<string, OptionValue> = Object.fromEntries(SHOP_SLOT_ROWS.map((row) => [row.key, true]));
const EVERY_POND_SPOT: ReadonlySet<LocationKey> = new Set(POND_INSTANCES.flatMap(pondCertifiedSpotsOf));

const CORPUS_SEEDS: Readonly<Record<string, () => Placement>> = {
  defaults: () => generatePlacement('net-defaults', buildOptionsSnapshot({})),
  keydrops: () => generatePlacement('net-keydrops',
    buildOptionsSnapshot({ key_drop_shuffle: true, include_npc_checks: true, include_world_items: true }),
    DELIVERABLE_NPC_SPOTS, undefined, DELIVERABLE_WORLD_SPOTS),
  shops: () => generatePlacement('net-shops',
    buildOptionsSnapshot({ ...EVERY_SHOP_SLOT, [SHOP_MODE_KEY]: 'custom', shop_slot_depth: 2 })),
  ponds: () => generatePlacement('net-ponds', buildOptionsSnapshot({
    pond_capacity_mode: 'custom', pond_capacity_items: 4, pond_capacity_throws: 6,
    pond_capacity_ask_rupees_min: '25', pond_capacity_ask_rupees_max: '300',
    pond_capacity_ask_bombs: true, pond_capacity_ask_bombs_min: 5, pond_capacity_ask_bombs_max: 10,
  }), NONE, EVERY_POND_SPOT, NONE),
  capacityLegacy: () => generatePlacement('net-capacity-legacy', buildOptionsSnapshot({
    capacity_explosives_mode: 'custom', capacity_projectiles_mode: 'custom',
    pond_capacity_mode: 'capacity', pond_wishing_mode: 'capacity', pond_cursed_mode: 'capacity',
  }), NONE, EVERY_POND_SPOT, NONE),
  wishPonds: () => generatePlacement('net-wish-ponds', buildOptionsSnapshot({
    pond_capacity_mode: 'capacity',
    pond_wishing_mode: 'custom', pond_wishing_items: 3, pond_wishing_throws: 5,
    pond_cursed_mode: 'vanilla-cost', pond_cursed_items: 2,
  }), NONE, EVERY_POND_SPOT, NONE),
};

export { CORPUS_SEEDS, ROOT };
