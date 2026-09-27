/* @layer shared-game @kind logic */
/**
 * The reference-faithful generation pipeline, driven by a frozen option
 * snapshot: seed the rng → build the fill world (the two entrance medallions
 * are always the fixed vanilla pair; standard mode locks a usable starting
 * weapon onto the mentor check, ItemPool.py 294-318) → place the dungeon
 * prizes: shuffled uniformly over the ten prize slots with the prize option
 * on (the reference's own model), each dungeon's VANILLA prize on its own
 * slot with it off, so a placement generated before the core could
 * substitute a boss prize keeps playing exactly as generated (see
 * vanilla-prizes.data.ts) → restrictive
 * dungeon prefill → assumed fill of the progression pool → shuffled junk
 * fill of the rest → verification sweep judged against the profile's
 * accessibility contract (accessibility/) + completion check, retried
 * with a derived seed on any fill dead-end or validity failure. Which items
 * the dungeon prefill handles at all, and how tightly, is the four
 * dungeon-item modes' question (dungeon-items/). The
 * npc-check scope option narrows generation the same way the key-drop
 * option does: OFF pre-places the npc-scope locations' vanilla items,
 * locked and fill-excluded, and removes them from the pool (fill-world +
 * scope-subtraction); ON opens only the scope locations the caller proved
 * physically deliverable and locks the rest the same way, so an absent
 * capability set counts as empty, so a caller with no physical probe still
 * always produces a valid (fully locked-scope) seed. The capacity profile
 * follows the same capability-locked mechanism for the fairy slots of its
 * non-vanilla families (a vanilla family's slot is not a location at all).
 */
import { createRng } from '../../rng';
import { accessibilityFailures } from '../accessibility/accessibility-check';
import {
  NPC_SCOPE_LOCATIONS, PRIZE_LOCATIONS, VANILLA_PRIZES, WORLD_ITEM_SCOPE_LOCATIONS,
} from '../scope-tables';
import { presentCapacitySpots } from '../capacity/capacity-spots';
import { buildFillWorld, fillEligibleLocations } from './fill-world';
import { fillOptionsFromSnapshot, shufflePrizesFromSnapshot } from './fill-options-from-snapshot';
import { progressiveSettingFromSnapshot } from '../progressive/progressive-from-snapshot';
import { assertRollableTickSet } from '../progressive/tick-set-check';
import { rollPrices } from './roll-placement-prices';
import { pondDemandsOfSnapshot } from './pond-demands-of-snapshot';
import { DEFAULT_RETRO_BOW } from '../retro/retro-bow.data';
import { prefillDungeonItems } from './dungeon-fill';
import { FillError, fillRestrictive } from './fill';
import { sweepPlacementSpheres } from './verify-placement';
import { verifyStandardEscape } from './verify-standard';
import type { RandomizerOptionsSnapshot } from '../options.type';
import type { PondDemandView } from '../pond/pond-ask.type';
import type { DeliverableSets } from './fill-options-from-snapshot';
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key';
import type { Placement } from './placement.type';

const MAX_PLACEMENT_ATTEMPTS = 20;

const EMPTY_DELIVERABLE: ReadonlySet<LocationKey> = new Set();

const countIn = (keys: Iterable<LocationKey>, deliverable: ReadonlySet<LocationKey>): number =>
  [...keys].filter((key) => deliverable.has(key)).length;

const attemptPlacement = (
  seed: string, attemptSeed: string, snapshot: RandomizerOptionsSnapshot, attempts: number,
  deliverable: Required<DeliverableSets>, pondDemands: PondDemandView,
): Placement => {
  const rng = createRng(attemptSeed);
  // The rolled flags are drawn from the SEED, never the attempt seed, so a
  // retry never moves what the profile already settled.
  const fillOptions = fillOptionsFromSnapshot(snapshot, deliverable, {
    pickBottle: (choices) => choices[rng.int(choices.length)],
    pickFiller: (count) => rng.int(count),
    pickWeapon: (choices) => choices[rng.int(choices.length)],
  }, seed);
  // Shelf prices roll BEFORE the world is built: the access rules read them
  // back (roll-placement-prices.ts). The pond demands were settled from the
  // seed alone, ahead of the first attempt, so the panel could show them.
  const shopPrices = rollPrices({ values: snapshot.values, options: fillOptions, rng });
  const fillWorld = buildFillWorld({ ...fillOptions, shopPrices, pondDemands });
  const {
    world, pool, keyDropShuffle, includeNpcChecks, includeWorldItems, capacity, capacityProgressive, capacityBonus,
    capacityCounts, shops, ponds, pondSlotsFollowMode, pondLocations, darkRooms, storyGates, progressiveTiers, progressiveModes, itemPower, retroBow,
    dungeonItems, accessibility,
  } = fillWorld;
  // Minimal accessibility is the only contract that lets the fill park an item
  // somewhere it can never be reached, and only once the goal is already
  // secured (Fill.py's perform_access_check).
  const relaxWhenBeatable = accessibility === 'minimal';

  const shufflePrizes = shufflePrizesFromSnapshot(snapshot);
  if (shufflePrizes) {
    // The reference's own model: the ten reward items over the ten reward slots,
    // uniformly (its pre-fill runs with an everything-collected state, which degenerates
    // to exactly this), with the reward slots kept reward-only by the item rule
    // (item-rules.data.ts, Rules.py 204-211). A placement that leaves something
    // unreachable is caught by the sweep below and retried on a derived seed.
    const slots = rng.shuffle([...PRIZE_LOCATIONS]);
    slots.forEach((slot, index) => world.placedItems.set(slot, pool.prizes[index]));
  } else {
    for (const [slot, prize] of VANILLA_PRIZES) world.placedItems.set(slot, prize);
  }

  prefillDungeonItems(fillWorld, rng);

  const openLocations = rng.shuffle(fillEligibleLocations(fillWorld));
  const progression = rng.shuffle(pool.progression);
  fillRestrictive({
    world, items: progression, locations: openLocations, assumedItems: [], relaxWhenBeatable,
  });

  const rest = rng.shuffle([...pool.useful, ...pool.filler]);
  if (openLocations.length !== rest.length) {
    throw new Error(`junk fill imbalance: ${openLocations.length} open vs ${rest.length} items`);
  }
  openLocations.forEach((location, index) => world.placedItems.set(location, rest[index]));

  const sweep = sweepPlacementSpheres(world);
  const unreachable = accessibilityFailures({
    mode: accessibility, capacity, uncollected: sweep.uncollected, placedItems: world.placedItems,
  });
  if (unreachable.length > 0) {
    throw new FillError(`${accessibility} accessibility`,
      `${unreachable.length} uncollectable: ${unreachable.slice(0, 5).join('; ')}`);
  }
  if (!sweep.beaten) throw new FillError('completion', 'goal not reachable at fill end');

  const locations = Object.fromEntries(
    [...world.locationsByKey.keys()].map((key) => [key, world.placedItems.get(key) as ItemKey]),
  ) as Record<LocationKey, ItemKey>;
  const escapeProblems = verifyStandardEscape(locations, capacity, retroBow.enabled);
  if (escapeProblems.length > 0) throw new FillError('standard escape', escapeProblems.join('; '));

  const fairySpots = presentCapacitySpots(capacity);
  return {
    seed,
    medallions: world.options.medallions,
    locations,
    shopPrices,
    pondDemands,
    spheres: sweep.spheres,
    stats: {
      attempts,
      keyDropShuffle,
      includeNpcChecks,
      includeWorldItems,
      shufflePrizes,
      capacityShuffle: fairySpots.length > 0,
      capacity,
      capacityProgressive,
      capacityBonus,
      capacityCounts,
      npcDeliverableCount: includeNpcChecks ? countIn(NPC_SCOPE_LOCATIONS.keys(), deliverable.npc) : 0,
      worldDeliverableCount: includeWorldItems ? countIn(WORLD_ITEM_SCOPE_LOCATIONS.keys(), deliverable.world) : 0,
      capacityDeliverableCount: countIn(fairySpots, deliverable.capacity),
      ponds,
      darkRooms,
      storyGates,
      pondPrizeCount: pondLocations.length,
      pondSlotsFollowMode,
      progressiveTiers,
      progressiveModes,
      retroBow,
      itemPower,
      dungeonItems,
      accessibility,
      shops,
      locationCount: world.locationsByKey.size,
      sphereCount: sweep.spheres.length,
    },
  };
};

const generatePlacement = (
  seed: string, snapshot: RandomizerOptionsSnapshot, deliverableNpcLocations?: ReadonlySet<LocationKey>,
  deliverableCapacityLocations?: ReadonlySet<LocationKey>,
  deliverableWorldLocations?: ReadonlySet<LocationKey>,
): Placement => {
  // A tick set that closed a load-bearing rung is said so here instead of
  // twenty attempts later as "the goal is not reachable" - the caller gets the
  // rung to tick back on instead of a seed that cannot be finished.
  assertRollableTickSet(progressiveSettingFromSnapshot(snapshot));
  const deliverable: Required<DeliverableSets> = {
    npc: deliverableNpcLocations ?? EMPTY_DELIVERABLE,
    capacity: deliverableCapacityLocations ?? EMPTY_DELIVERABLE,
    world: deliverableWorldLocations ?? EMPTY_DELIVERABLE,
  };
  // Settled once, from the seed alone: every attempt is handed the same
  // demands, which is what lets the options panel show them before a placement
  // exists at all (pond-demands-of-snapshot.ts).
  const pondDemands = pondDemandsOfSnapshot(snapshot, seed, deliverable);
  let lastMessage = '';
  for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt += 1) {
    const attemptSeed = attempt === 0 ? seed : `${seed}#retry${attempt}`;
    try {
      return attemptPlacement(seed, attemptSeed, snapshot, attempt + 1, deliverable, pondDemands);
    } catch (error) {
      if (!(error instanceof FillError)) throw error;
      lastMessage = error.message;
    }
  }
  throw new Error(
    `generation failed for seed "${seed}" after ${MAX_PLACEMENT_ATTEMPTS} attempts, last: ${lastMessage}`,
  );
};

export { generatePlacement, MAX_PLACEMENT_ATTEMPTS };
