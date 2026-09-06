/* @layer tests @kind test */
/**
 * Generation sweeps over representative tier tick sets. A returned placement is
 * itself the proof of beatability: generateApPlacement only hands one back once
 * the sweep has collected every location AND reached the goal, so a set that
 * rolls thirty seeds in a row is a set that plays.
 *
 * The sets that cannot be rolled are pinned just as hard, because that is the
 * point of the guard: a rung that is load-bearing under the rules this app
 * transcribes leaves a seed with no ending, and the generator must say so up
 * front, naming the rung, instead of handing over a placement nobody can finish.
 * The blade rungs used to be on that list and no longer are, because the core grew
 * the stand-ins the reference's swordless mode has, so a file with no blade in
 * it reaches the ending on the hammer and a pulled-down cloth door.
 */
import { describe, expect, it } from 'vitest';
import { buildOptionsSnapshot } from '@shared/randomizer/options-snapshot';
import { generateApPlacement } from '@shared/randomizer/ap-world/fill/generate-ap';
import { buildFillWorld } from '@shared/randomizer/ap-world/fill/fill-world';
import { fillOptionsFromSnapshot } from '@shared/randomizer/ap-world/fill/fill-options-from-snapshot';
import { ProgressiveTierError } from '@shared/randomizer/ap-world/progressive/tick-set-check';
import { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS } from '@shared/randomizer/ap-world/scope-vanilla.data';
import {
  defaultProgressiveSetting, progressiveValuesOf,
} from '@shared/randomizer/ap-world/progressive/progressive-from-snapshot';
import type { ProgressiveFamilyId, ProgressiveSetting } from '@shared/randomizer/ap-world/progressive/progressive.type';

const SEEDS = 30;

/** The default set with the named rungs unticked. */
const withUnticked = (...off: Array<[ProgressiveFamilyId, number]>): ProgressiveSetting => {
  const setting = defaultProgressiveSetting() as Record<ProgressiveFamilyId, boolean[]>;
  for (const [family, index] of off) setting[family][index] = false;
  return setting as ProgressiveSetting;
};

const snapshotOf = (setting: ProgressiveSetting) => buildOptionsSnapshot(progressiveValuesOf(setting));

/**
 * The same snapshot with both scope tables shuffled and every one of their
 * locations proven deliverable. It is the only reading under which the blade
 * ticks can reach anything: with the character and world checks OUT of the
 * shuffle, all four blade copies are claimed by their own vanilla givers and
 * the shuffled pool carries none to take out (the first case below pins that).
 */
const shuffledScopeSnapshot = (setting: ProgressiveSetting) => buildOptionsSnapshot({
  ...progressiveValuesOf(setting), include_npc_checks: true, include_world_items: true,
});

const EVERY_SCOPE = {
  npc: new Set(NPC_SCOPE_LOCATIONS.keys()),
  world: new Set(WORLD_ITEM_SCOPE_LOCATIONS.keys()),
};

const poolOf = (setting: ProgressiveSetting): readonly string[] =>
  buildFillWorld(fillOptionsFromSnapshot(snapshotOf(setting), {})).pool.pool;

const shuffledScopePoolOf = (setting: ProgressiveSetting): readonly string[] =>
  buildFillWorld(fillOptionsFromSnapshot(shuffledScopeSnapshot(setting), EVERY_SCOPE)).pool.pool;

const countIn = (pool: readonly string[], name: string): number =>
  pool.filter((item) => item === name).length;

const ALL_ON = defaultProgressiveSetting();
const NO_GOLD_SWORD = withUnticked(['sword', 3]);
const NO_TOP_MAIL = withUnticked(['mail', 1]);
const NO_MIDDLE_SWORD = withUnticked(['sword', 1]);
const NO_SWORDS = withUnticked(['sword', 0], ['sword', 1], ['sword', 2], ['sword', 3]);
const ONLY_FIRST_SWORD = withUnticked(['sword', 1], ['sword', 2], ['sword', 3]);
const NO_BOW = withUnticked(['bow', 0], ['bow', 1]);

const ROLLABLE: Array<[string, ProgressiveSetting]> = [
  ['every tier ticked', ALL_ON],
  ['no top blade', NO_GOLD_SWORD],
  ['no top armour', NO_TOP_MAIL],
  ['a blade rung missing from the middle', NO_MIDDLE_SWORD],
  // Both blade-poor sets roll now that the core carries the stand-ins: a hanging cloth door
  // can be pulled down, and the hammer breaks the tower's seal and lands on the last fight.
  ['no blade at all', NO_SWORDS],
  ['the first blade only', ONLY_FIRST_SWORD],
];

const REFUSED: Array<[string, ProgressiveSetting, string]> = [
  ['no bow at all', NO_BOW, 'Bow'],
];

describe('generation over representative tier tick sets', () => {
  for (const [name, setting] of ROLLABLE) {
    it(`rolls ${SEEDS} beatable seeds with ${name}`, () => {
      for (let index = 0; index < SEEDS; index += 1) {
        const placement = generateApPlacement(`tier-${name}-${index}`, snapshotOf(setting));
        expect(placement.stats.sphereCount, `seed ${index}`).toBeGreaterThan(0);
        expect(placement.stats.progressiveTiers).toEqual(setting);
      }
    }, 120_000);
  }

  it('rolls beatable seeds with the ticks really biting, both scopes shuffled', () => {
    for (let index = 0; index < SEEDS; index += 1) {
      const placement = generateApPlacement(
        `tier-scoped-${index}`, shuffledScopeSnapshot(NO_GOLD_SWORD), EVERY_SCOPE.npc, undefined, EVERY_SCOPE.world,
      );
      expect(placement.stats.sphereCount, `seed ${index}`).toBeGreaterThan(0);
    }
  }, 120_000);

  for (const [name, setting, family] of REFUSED) {
    it(`refuses ${name}, naming the rung to tick back on`, () => {
      expect(() => generateApPlacement('tier-refused', snapshotOf(setting)))
        .toThrow(ProgressiveTierError);
      try {
        generateApPlacement('tier-refused', snapshotOf(setting));
      } catch (error) {
        expect(String((error as Error).message)).toContain(family);
      }
    });
  }
});

describe('an unticked rung leaves the pool the same size', () => {
  it('swaps the copy for the reference own stand-in instead of shrinking the pool', () => {
    const full = shuffledScopePoolOf(ALL_ON);
    const trimmed = shuffledScopePoolOf(NO_GOLD_SWORD);
    expect(trimmed.length).toBe(full.length);
    expect(countIn(full, 'Progressive Sword')).toBe(4);
    expect(countIn(trimmed, 'Progressive Sword')).toBe(3);
    expect(countIn(trimmed, 'Rupees (20)')).toBe(countIn(full, 'Rupees (20)') + 1);
  });

  it('takes every blade out of the shuffle when no blade rung is ticked', () => {
    const pool = shuffledScopePoolOf(NO_SWORDS);
    expect(countIn(pool, 'Progressive Sword')).toBe(0);
    expect(pool.length).toBe(shuffledScopePoolOf(ALL_ON).length);
  });

  it('reaches nothing while the blades are handed over by checks left out of the shuffle', () => {
    // All four blade copies are the vanilla items of character checks, so with those
    // checks locked the shuffled pool never carried one and a tick has nothing to take:
    // those givers go on handing their tiers over whatever the ticks say.
    expect(countIn(poolOf(ALL_ON), 'Progressive Sword')).toBe(0);
    expect(countIn(poolOf(NO_GOLD_SWORD), 'Progressive Sword')).toBe(0);
    expect(poolOf(NO_GOLD_SWORD).length).toBe(poolOf(ALL_ON).length);
  });

  it('a shield rung is reachable either way, since the shuffle carries those copies', () => {
    const carried = countIn(poolOf(ALL_ON), 'Progressive Shield');
    expect(carried).toBeGreaterThan(0);
    expect(countIn(poolOf(withUnticked(['shield', 2])), 'Progressive Shield')).toBe(carried - 1);
  });
});
