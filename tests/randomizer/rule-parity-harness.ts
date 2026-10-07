/* @layer tests @kind helper */
/**
 * The measuring side of the rule-node parity guard: build a world the way generation builds it,
 * then ask every location rule and every exit rule over thousands of seeded random collection
 * states and fold the answers into one digest. Two builds of the engine that answer the same
 * way everywhere produce the same digest, so a pinned digest holds the rule language to its
 * old behaviour through any rewrite of how the rules are stored.
 */
import { createHash } from 'node:crypto';
import { all } from '@shared/game/data';
import { createRng } from '@shared/randomizer/rng';
import { baselineValues } from '@shared/randomizer/world/options.data';
import { ITEM, UNRECORDED } from '@shared/randomizer/world/item-ids.data';
import { buildFillWorld } from '@shared/randomizer/world/fill/fill-world';
import { fillOptionsFromSnapshot } from '@shared/randomizer/world/fill/fill-options-from-snapshot';
import { rollPrices } from '@shared/randomizer/world/fill/roll-placement-prices';
import { pondDemandsOfSnapshot } from '@shared/randomizer/world/fill/pond-demands-of-snapshot';
import { actTokensOf } from '@shared/randomizer/world/events/event-gates';
import { createCollectionState } from '@shared/randomizer/world/collection-state';
import type { Holding } from '@shared/randomizer/world/collection-state';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { World } from '@shared/randomizer/world/world.type';
import type { OptionValue, RandomizerOptionsSnapshot } from '@shared/randomizer/world/options.type';

const SEED = 'rule-parity';

const snapshotOf = (over: Record<string, OptionValue>): RandomizerOptionsSnapshot =>
  ({ schema: 'ap-options-v2', values: { ...baselineValues, ...over } });

/** mulberry32: a small seeded generator, so the states are the same on every run. */
const seededRandom = (seed: number) => {
  let a = seed >>> 0;
  return (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** The world generation would build for this snapshot on this seed, prices and demands rolled. */
const worldOfSnapshot = (over: Record<string, OptionValue>): { world: World; items: Holding[] } => {
  const snapshot = snapshotOf(over);
  const fillOptions = fillOptionsFromSnapshot(snapshot, {}, {}, SEED);
  const shopPrices = rollPrices({ values: snapshot.values, options: fillOptions, rng: createRng(SEED) });
  const pondDemands = pondDemandsOfSnapshot(snapshot, SEED);
  const fillWorld = buildFillWorld({ ...fillOptions, shopPrices, pondDemands });
  const { pool } = fillWorld;
  const universe = new Set<Holding>([
    ...Object.values(ITEM), ...Object.values(UNRECORDED), ...pool.pool, ...pool.prizes,
    ...[...pool.dungeonItems.values()].flat(), ...fillWorld.lockedVanilla.values(),
    ...actTokensOf(all('check').map((check) => check.id)),
  ]);
  return { world: fillWorld.world, items: [...universe].sort() };
};

/** One random collection state: a density drawn per state, then up to three copies per holding. */
const randomState = (world: World, items: readonly Holding[], random: () => number) => {
  const state = createCollectionState(world);
  const density = random();
  for (const item of items) {
    if (random() >= density * 0.7) continue;
    state.collect(item);
    if (random() < density * 0.4) state.collect(item);
    if (random() < density * 0.2) state.collect(item);
  }
  return state;
};

/** Half of the states see a random fill seam, so the placement-reading rules answer both ways. */
const scatterPlacements = (world: World, items: readonly Holding[], random: () => number): void => {
  world.placedItems.clear();
  for (const key of world.locationsByKey.keys()) {
    if (random() < 0.5) world.placedItems.set(key, items[Math.floor(random() * items.length)] as ItemKey);
  }
};

interface ParityDigest {
  digest: string;
  trues: number;
}

/**
 * Every location rule, story event rule and exit rule, asked over `states` random states. `actRecord` hands
 * the world a random record of done acts, the reading a world built from a save file answers
 * from, so the rules that fall back when no record is attached are asked both ways.
 */
const ruleDigest = (over: Record<string, OptionValue>, states: number, actRecord = false): ParityDigest => {
  const { world, items } = worldOfSnapshot(over);
  const random = seededRandom(states * 7919 + Object.keys(over).length);
  const tokens = actTokensOf(all('check').map((check) => check.id));
  const hash = createHash('sha256');
  const locations = [...world.locationRules.entries(), ...world.eventRules.entries()];
  const exits = [...world.rules.entries()];
  let trues = 0;
  for (let index = 0; index < states; index += 1) {
    if (index % 2 === 1) scatterPlacements(world, items, random);
    else world.placedItems.clear();
    if (actRecord) {
      (world.options as { actTokens?: ReadonlySet<Holding> }).actTokens =
        new Set([...tokens].filter(() => random() < 0.5));
    }
    const state = randomState(world, items, random);
    let bits = '';
    for (const [, rule] of locations) bits += rule(state) ? '1' : '0';
    for (const [, rule] of exits) bits += rule(state) ? '1' : '0';
    for (const char of bits) if (char === '1') trues += 1;
    hash.update(bits);
  }
  const names = [...locations.map(([key]) => key as LocationKey), ...exits.map(([name]) => name)].join('|');
  hash.update(names);
  return { digest: hash.digest('hex').slice(0, 20), trues };
};

/** A placement written with its maps and sets spelled out, so the digest sees every entry. */
const placementDigest = (placement: unknown): string => createHash('sha256')
  .update(JSON.stringify(placement, (_key, value: unknown) => {
    if (value instanceof Map) return [...value.entries()];
    if (value instanceof Set) return [...value.values()];
    return value;
  }))
  .digest('hex')
  .slice(0, 20);

export {
  placementDigest, randomState, ruleDigest, scatterPlacements, seededRandom, snapshotOf, worldOfSnapshot,
};
export type { ParityDigest };
