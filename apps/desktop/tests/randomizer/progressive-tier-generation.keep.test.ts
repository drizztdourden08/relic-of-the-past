/* @layer tests @kind test */
import type { ItemKey, ProgressiveFamilyId, ProgressiveSetting } from '@rotp/randomizer';
import { ITEM, buildOptionsSnapshot, generatePlacement, buildFillWorld, fillOptionsFromSnapshot, ProgressiveTierError, NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS, defaultProgressiveSetting, progressiveValuesOf } from '@rotp/randomizer';
import { describe, expect, it } from 'vitest';

const SEEDS = 30;

const withUnticked = (...off: Array<[ProgressiveFamilyId, number]>): ProgressiveSetting => {
  const setting = defaultProgressiveSetting() as Record<ProgressiveFamilyId, boolean[]>;
  for (const [family, index] of off) setting[family][index] = false;
  return setting;
};

const snapshotOf = (setting: ProgressiveSetting) => buildOptionsSnapshot(progressiveValuesOf(setting));

const shuffledScopeSnapshot = (setting: ProgressiveSetting) => buildOptionsSnapshot({
  ...progressiveValuesOf(setting), include_npc_checks: true, include_world_items: true,
});

const EVERY_SCOPE = {
  npc: new Set(NPC_SCOPE_LOCATIONS.keys()),
  world: new Set(WORLD_ITEM_SCOPE_LOCATIONS.keys()),
};

const poolOf = (setting: ProgressiveSetting): readonly ItemKey[] =>
  buildFillWorld(fillOptionsFromSnapshot(snapshotOf(setting), {})).pool.pool;

const shuffledScopePoolOf = (setting: ProgressiveSetting): readonly ItemKey[] =>
  buildFillWorld(fillOptionsFromSnapshot(shuffledScopeSnapshot(setting), EVERY_SCOPE)).pool.pool;

const countIn = (pool: readonly ItemKey[], wanted: ItemKey): number =>
  pool.filter((item) => item === wanted).length;

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
        const placement = generatePlacement({ seed: `tier-${name}-${index}`, snapshot: snapshotOf(setting) });
        expect(placement.stats.sphereCount, `seed ${index}`).toBeGreaterThan(0);
        expect(placement.stats.progressiveTiers).toEqual(setting);
      }
    }, 120_000);
  }

  it('rolls beatable seeds with the ticks biting, both scopes shuffled', () => {
    for (let index = 0; index < SEEDS; index += 1) {
      const placement = generatePlacement({
        seed: `tier-scoped-${index}`, snapshot: shuffledScopeSnapshot(NO_GOLD_SWORD),
        deliverable: { npc: EVERY_SCOPE.npc, world: EVERY_SCOPE.world },
      });
      expect(placement.stats.sphereCount, `seed ${index}`).toBeGreaterThan(0);
    }
  }, 120_000);

  for (const [name, setting, family] of REFUSED) {
    it(`refuses ${name}, naming the rung to tick back on`, () => {
      expect(() => generatePlacement({ seed: 'tier-refused', snapshot: snapshotOf(setting) }))
        .toThrow(ProgressiveTierError);
      try {
        generatePlacement({ seed: 'tier-refused', snapshot: snapshotOf(setting) });
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
    expect(countIn(full, ITEM.progressiveSword)).toBe(4);
    expect(countIn(trimmed, ITEM.progressiveSword)).toBe(3);
    expect(countIn(trimmed, ITEM.rupees20)).toBe(countIn(full, ITEM.rupees20) + 1);
  });

  it('takes every blade out of the shuffle when no blade rung is ticked', () => {
    const pool = shuffledScopePoolOf(NO_SWORDS);
    expect(countIn(pool, ITEM.progressiveSword)).toBe(0);
    expect(pool.length).toBe(shuffledScopePoolOf(ALL_ON).length);
  });

  it('reaches nothing while the blades are handed over by checks left out of the shuffle', () => {
    expect(countIn(poolOf(ALL_ON), ITEM.progressiveSword)).toBe(0);
    expect(countIn(poolOf(NO_GOLD_SWORD), ITEM.progressiveSword)).toBe(0);
    expect(poolOf(NO_GOLD_SWORD).length).toBe(poolOf(ALL_ON).length);
  });

  it('a shield rung is reachable either way, since the shuffle carries those copies', () => {
    const carried = countIn(poolOf(ALL_ON), ITEM.progressiveShield);
    expect(carried).toBeGreaterThan(0);
    expect(countIn(poolOf(withUnticked(['shield', 2])), ITEM.progressiveShield)).toBe(carried - 1);
  });
});
