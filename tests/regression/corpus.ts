/* @layer test @kind helper */
/**
 * The save states and the seeds the regression net runs over. Both are discovered, never
 * listed, so a milestone save dropped into the profile or the fixtures folder joins the net
 * with no edit here. Reads only; nothing in this file writes a save.
 */
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { generatePlacement } from '@shared/randomizer/world/fill/generate';
import { buildOptionsSnapshot } from '@shared/randomizer/options-snapshot';
import { POND_INSTANCES } from '@shared/randomizer/world/pond/pond-instances';
import { pondCertifiedSpotsOf } from '@shared/randomizer/world/pond/pond-spots';
import { SHOP_MODE_KEY, SHOP_SLOT_ROWS } from '@shared/randomizer/world/shops/shop-slot-options.data';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { OptionValue } from '@shared/randomizer/world/options.type';
import type { LocationKey } from '@shared/randomizer/world/location-key';

const ROOT = resolve(__dirname, '../..');
const NONE: ReadonlySet<LocationKey> = new Set();
/** The four npc-scope spots the net proves deliverable, and the four world-item ones. */
const NPC = new Set<LocationKey>(['check-019', 'check-033', 'check-060', 'check-121']);
const WORLD = new Set<LocationKey>(['check-055', 'check-080', 'check-126', 'check-009']);
const EVERY_SHOP_SLOT: Record<string, OptionValue> = Object.fromEntries(SHOP_SLOT_ROWS.map((row) => [row.key, true]));
/** Every pond's own pair proven deliverable, so no pond is held back for want of a seam. */
const EVERY_POND_SPOT: ReadonlySet<LocationKey> = new Set(POND_INSTANCES.flatMap(pondCertifiedSpotsOf));

interface SaveEntry {
  /** Stable name: the corpus key, so a baseline keeps meaning across runs. */
  name: string;
  path: string;
}

const savesIn = (kind: string, dir: string): SaveEntry[] =>
  (existsSync(dir) ? readdirSync(dir) : [])
    .filter((file) => file.endsWith('.sav')).sort()
    .map((file) => ({ name: `${kind}/${file}`, path: resolve(dir, file) }));

/** Every quick slot of every profile, every save-state fixture, every milestone save. */
const corpusSaves = (): SaveEntry[] => {
  const profiles = resolve(ROOT, '.user-data/Data/profiles');
  const perProfile = (existsSync(profiles) ? readdirSync(profiles) : []).flatMap((profile) => [
    ...savesIn('quick', resolve(profiles, profile, 'saves/quick')),
    ...savesIn('manual', resolve(profiles, profile, 'saves/normal')),
  ]);
  return [...perProfile, ...savesIn('fixture', resolve(ROOT, 'tests/fixtures/save-states'))];
};

/**
 * Fixed seeds, one per shape of world the rules have to answer for. Append only: removing or
 * editing one makes every stored baseline unreadable for that seed.
 */
const CORPUS_SEEDS: Readonly<Record<string, () => Placement>> = {
  defaults: () => generatePlacement('net-defaults', buildOptionsSnapshot({})),
  keydrops: () => generatePlacement('net-keydrops',
    buildOptionsSnapshot({ key_drop_shuffle: true, include_npc_checks: true, include_world_items: true }), NPC, undefined, WORLD),
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

export { CORPUS_SEEDS, ROOT, corpusSaves };
export type { SaveEntry };
