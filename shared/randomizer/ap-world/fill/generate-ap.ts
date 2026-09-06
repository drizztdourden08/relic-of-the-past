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
 * physically deliverable and locks the rest the same way — an absent
 * capability set counts as empty, so a caller with no physical probe still
 * always produces a valid (fully locked-scope) seed. The capacity profile
 * follows the same capability-locked mechanism for the fairy slots of its
 * non-vanilla families (a vanilla family's slot is not a location at all).
 */
import { createRng } from '../../rng';
import { accessibilityFailures } from '../accessibility/accessibility-check';
import { VANILLA_PRIZES } from '../vanilla-prizes.data';
import { PRIZE_LOCATIONS } from '../special-locations.data';
import { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS } from '../scope-vanilla.data';
import { presentCapacitySpots } from '../capacity/capacity-spots';
import { buildFillWorld, fillEligibleLocations } from './fill-world';
import { fillOptionsFromSnapshot, shufflePrizesFromSnapshot } from './fill-options-from-snapshot';
import { progressiveSettingFromSnapshot } from '../progressive/progressive-from-snapshot';
import { assertRollableTickSet } from '../progressive/tick-set-check';
import { rollShopPrices, shopPricePlanOf } from '../shops/shop-price-plan';
import { DEFAULT_RETRO_BOW } from '../retro/retro-bow.data';
import { shopSlotLocationsOf } from '../shops/shop-slots';
import { NO_SHOP_SCOPE } from '../shops/shop-scope-from-values';
import { prefillDungeonItems } from './dungeon-fill';
import { ApFillError, fillRestrictive } from './ap-fill';
import { sweepPlacementSpheres } from './verify-placement';
import { verifyStandardEscape } from './verify-standard';
import type { RandomizerOptionsSnapshot } from '../options.type';
import type { DeliverableSets } from './fill-options-from-snapshot';
import type { ApPlacement } from './ap-placement.type';

const MAX_AP_ATTEMPTS = 20;

const EMPTY_DELIVERABLE: ReadonlySet<string> = new Set();

const countIn = (names: Iterable<string>, deliverable: ReadonlySet<string>): number =>
  [...names].filter((name) => deliverable.has(name)).length;

const attemptApPlacement = (
  seed: string, attemptSeed: string, snapshot: RandomizerOptionsSnapshot, attempts: number,
  deliverable: Required<DeliverableSets>,
): ApPlacement => {
  const rng = createRng(attemptSeed);
  // The pond's schedule is drawn from the SEED, never the attempt seed, so a
  // retry never moves a gamble's winning throws.
  const fillOptions = fillOptionsFromSnapshot(snapshot, deliverable, {
    pickBottle: (choices) => choices[rng.int(choices.length)],
    pickFiller: (count) => rng.int(count),
    pickWeapon: (choices) => choices[rng.int(choices.length)],
  }, seed);
  // Prices are rolled BEFORE the world is built, because the access rules read
  // them: a shelf the file could never pay for is out of logic, and the fill
  // has to know that before it places anything.
  const shopPrices = rollShopPrices(
    shopSlotLocationsOf(fillOptions.shops ?? NO_SHOP_SCOPE),
    shopPricePlanOf(snapshot.values), rng, fillOptions.capacity,
  );
  const fillWorld = buildFillWorld({ ...fillOptions, shopPrices });
  const {
    world, pool, keyDropShuffle, includeNpcChecks, includeWorldItems, capacity, capacityProgressive, capacityBonus,
    capacityCounts, shops, pond, pondLocations, darkRooms, progressiveTiers, progressiveModes, itemPower, retroBow,
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
    throw new ApFillError(`${accessibility} accessibility`,
      `${unreachable.length} uncollectable: ${unreachable.slice(0, 5).join('; ')}`);
  }
  if (!sweep.beaten) throw new ApFillError('completion', 'goal not reachable at fill end');

  const nameView = Object.fromEntries(
    [...world.locationsByName.keys()].map((name) => [name, world.placedItems.get(name) as string]),
  );
  const escapeProblems = verifyStandardEscape(nameView, capacity, retroBow.enabled);
  if (escapeProblems.length > 0) throw new ApFillError('standard escape', escapeProblems.join('; '));

  const fairySpots = presentCapacitySpots(capacity);
  return {
    seed,
    medallions: world.options.medallions,
    nameView,
    shopPrices,
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
      pond,
      darkRooms,
      pondPrizeCount: pondLocations.length,
      progressiveTiers,
      progressiveModes,
      retroBow,
      itemPower,
      dungeonItems,
      accessibility,
      shops,
      locationCount: world.locationsByName.size,
      sphereCount: sweep.spheres.length,
    },
  };
};

const generateApPlacement = (
  seed: string, snapshot: RandomizerOptionsSnapshot, deliverableNpcLocations?: ReadonlySet<string>,
  deliverableCapacityLocations?: ReadonlySet<string>,
  deliverableWorldLocations?: ReadonlySet<string>,
): ApPlacement => {
  // A tick set that closed a load-bearing rung is said so here rather than
  // twenty attempts later as "the goal is not reachable" - the caller gets the
  // rung to tick back on instead of a seed that cannot be finished.
  assertRollableTickSet(progressiveSettingFromSnapshot(snapshot));
  const deliverable: Required<DeliverableSets> = {
    npc: deliverableNpcLocations ?? EMPTY_DELIVERABLE,
    capacity: deliverableCapacityLocations ?? EMPTY_DELIVERABLE,
    world: deliverableWorldLocations ?? EMPTY_DELIVERABLE,
  };
  let lastMessage = '';
  for (let attempt = 0; attempt < MAX_AP_ATTEMPTS; attempt += 1) {
    const attemptSeed = attempt === 0 ? seed : `${seed}#retry${attempt}`;
    try {
      return attemptApPlacement(seed, attemptSeed, snapshot, attempt + 1, deliverable);
    } catch (error) {
      if (!(error instanceof ApFillError)) throw error;
      lastMessage = error.message;
    }
  }
  throw new Error(
    `generation failed for seed "${seed}" after ${MAX_AP_ATTEMPTS} attempts — last: ${lastMessage}`,
  );
};

export { generateApPlacement, MAX_AP_ATTEMPTS };
