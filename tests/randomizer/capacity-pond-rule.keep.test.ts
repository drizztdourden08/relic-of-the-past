/* @layer tests @kind test */
/**
 * Guard: the capacity upgrades can never exist NOWHERE.
 *
 * The pond is the only native source of the explosives and projectiles
 * upgrades, so a family left Vanilla while the pond hands out pool items has
 * no source anywhere in the seed: a silent hole, with a legal-looking
 * profile on top of it. This walks every combination the two tabs can put the
 * pair in, settles it through the rule, and proves three things: the settled
 * pair never has that hole, it is stable (settling again changes nothing),
 * and every control the panel still OFFERS from it leads to another pair
 * without the hole. That last case is what makes the enumeration a proof
 * about reachable states instead of about one screen.
 *
 * Retro bow is walked alongside: with every shot paid for the projectiles
 * family needs no source and reads as Vanilla, and the pond is judged on the
 * explosives family alone.
 */
import { describe, expect, it } from 'vitest';
import { POND_FED_FAMILIES, reconcileCapacityPond } from '@shared/randomizer/ap-world/capacity-pond';
import { customSetting } from '@shared/randomizer/ap-world/capacity';
import {
  capacityEnabledOf, capacityProfileFromSnapshot,
} from '@shared/randomizer/ap-world/capacity/capacity-profile-from-snapshot';
import { pondSettingFromSnapshot } from '@shared/randomizer/ap-world/pond/pond-from-snapshot';
import { pondSettingForMode } from '@shared/randomizer/ap-world/pond/pond-mode-switch';
import { DEFAULT_ITEM_POWER } from '@shared/randomizer/ap-world/item-power/item-power.data';
import { defaultProgressiveSetting } from '@shared/randomizer/ap-world/progressive/progressive-from-snapshot';
import { defaultRetroBow } from '@shared/randomizer/ap-world/retro/retro-from-snapshot';
import { LEGACY_POND_SETTING } from '@shared/randomizer/ap-world/pond/pond-profile-defaults';
import { defaultShopScope } from '@shared/randomizer/ap-world/shops/shop-scope-from-values';
import { buildOptionsSnapshot } from '@shared/randomizer/options-snapshot';
import { randomizerChoiceOverrides } from '@app/hooks/randomizer/randomizer-choices';
import type {
  CapacityPondAuthority, CapacityPondSelection,
} from '@shared/randomizer/ap-world/capacity-pond';
import type { CapacityProfile, FamilySetting } from '@shared/randomizer/ap-world/capacity';
import type { PondMode, PondSetting } from '@shared/randomizer/ap-world/pond/pond-profile.type';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';

const POND_MODES: readonly PondMode[] = ['capacity', 'vanilla-cost', 'custom', 'gamble'];
const FAMILY_MODES = ['vanilla', 'vanilla-in-pool', 'custom'] as const;
const AUTHORITIES: readonly CapacityPondAuthority[] = ['pond', 'capacity', 'explosives', 'projectiles', 'meter', 'wallet'];

type FamilyMode = (typeof FAMILY_MODES)[number];

const settingFor = (mode: FamilyMode, start: number, max: number): FamilySetting =>
  (mode === 'custom' ? customSetting(start, max, 1) : { mode });

const profileOf = (explosives: FamilyMode, projectiles: FamilyMode): CapacityProfile => ({
  explosives: settingFor(explosives, 10, 15),
  projectiles: settingFor(projectiles, 30, 35),
  meter: { mode: 'vanilla-in-pool' },
  wallet: { mode: 'vanilla' },
});

const selectionOf = (
  enabled: boolean, pondMode: PondMode, explosives: FamilyMode, projectiles: FamilyMode, retroBow = false,
): CapacityPondSelection => ({
  enabled,
  capacity: profileOf(explosives, projectiles),
  pond: pondSettingForMode(pondMode, LEGACY_POND_SETTING),
  retroBow,
});

/** Every pair the two tabs can be put into, with the control that moved last, under both retro readings. */
const combinations = (): Array<{ selection: CapacityPondSelection; authority: CapacityPondAuthority }> => {
  const all: Array<{ selection: CapacityPondSelection; authority: CapacityPondAuthority }> = [];
  for (const enabled of [true, false]) {
    for (const retroBow of [false, true]) {
      for (const pondMode of POND_MODES) {
        for (const explosives of FAMILY_MODES) {
          for (const projectiles of FAMILY_MODES) {
            for (const authority of AUTHORITIES) {
              all.push({ selection: selectionOf(enabled, pondMode, explosives, projectiles, retroBow), authority });
            }
          }
        }
      }
    }
  }
  return all;
};

/**
 * The hole this whole feature exists to close: a family whose upgrades are
 * neither sold at the pond nor placed in the pool. Under retro the projectiles
 * family is out of the question: every shot is paid for, so it has to read as
 * Vanilla and needs no source.
 */
const hasSource = (setting: FamilySetting, pond: PondSetting): boolean =>
  (setting.mode === 'vanilla' ? pond.mode === 'capacity' : true);

const bothHaveSource = (capacity: CapacityProfile, pond: PondSetting, retroBow = false): boolean =>
  hasSource(capacity.explosives, pond)
  && (retroBow ? capacity.projectiles.mode === 'vanilla' : hasSource(capacity.projectiles, pond));

const BASE_CHOICES: Omit<RandomizerOptionChoices, 'capacityEnabled' | 'capacity' | 'pond' | 'retroBow'> = {
  keyDropShuffle: true,
  includeNpcChecks: false,
  includeWorldItems: false,
  shufflePrizes: false,
  shops: defaultShopScope(),
  shopPrices: {},
  capacityProgressive: true,
  progressiveTiers: defaultProgressiveSetting(),
  itemPower: DEFAULT_ITEM_POWER,
};

describe('the capacity/pond rule leaves no seed without its upgrades', () => {
  it('settles every combination of the two tabs into a pair with a source', () => {
    for (const { selection, authority } of combinations()) {
      const settled = reconcileCapacityPond(selection, authority);
      expect(bothHaveSource(settled.capacity, settled.pond, selection.retroBow), JSON.stringify(settled)).toBe(true);
    }
  });

  it('is stable: settling a settled pair again changes nothing, under either authority', () => {
    for (const { selection, authority } of combinations()) {
      const once = reconcileCapacityPond(selection, authority);
      for (const again of AUTHORITIES) {
        const twice = reconcileCapacityPond(once, again);
        expect(twice.capacity).toEqual(once.capacity);
        expect(twice.pond).toEqual(once.pond);
      }
    }
  });

  it('takes the whole feature out when the master switch is off', () => {
    for (const { selection, authority } of combinations().filter((entry) => !entry.selection.enabled)) {
      const settled = reconcileCapacityPond(selection, authority);
      expect(Object.values(settled.capacity).map((setting) => setting.mode)).toEqual(['vanilla', 'vanilla', 'vanilla', 'vanilla']);
      expect(settled.pond).toEqual(LEGACY_POND_SETTING);
      expect(settled.pondModes).toEqual(['capacity']);
      expect(settled.capacityEditable).toBe(false);
      expect(settled.pondEditable).toBe(false);
      expect(authority).toBeDefined();
    }
  });

  it('offers no pond mode that would open the hole', () => {
    for (const { selection, authority } of combinations()) {
      const settled = reconcileCapacityPond(selection, authority);
      for (const mode of settled.pondModes) {
        const next = reconcileCapacityPond({ ...settled, pond: pondSettingForMode(mode, settled.pond) }, 'pond');
        expect(bothHaveSource(next.capacity, next.pond, settled.retroBow), `pond -> ${mode}`).toBe(true);
      }
    }
  });

  it('offers no family mode that would open the hole', () => {
    for (const { selection, authority } of combinations()) {
      const settled = reconcileCapacityPond(selection, authority);
      for (const family of POND_FED_FAMILIES) {
        for (const mode of FAMILY_MODES) {
          const capacity = { ...settled.capacity, [family]: settingFor(mode, 10, 15) };
          const next = reconcileCapacityPond({ ...settled, capacity }, family);
          expect(bothHaveSource(next.capacity, next.pond, settled.retroBow), `${family} -> ${mode}`).toBe(true);
        }
      }
    }
  });

  it('freezes a snapshot with a source, whatever the panel hands the writer', () => {
    for (const { selection } of combinations()) {
      const snapshot = buildOptionsSnapshot(randomizerChoiceOverrides({
        ...BASE_CHOICES, capacityEnabled: selection.enabled, capacity: selection.capacity, pond: selection.pond,
        retroBow: { ...defaultRetroBow(), enabled: selection.retroBow },
      }));
      const capacity = capacityProfileFromSnapshot(snapshot);
      const pond = pondSettingFromSnapshot(snapshot);
      expect(bothHaveSource(capacity, pond, selection.retroBow), JSON.stringify(snapshot.values)).toBe(true);
      expect(capacityEnabledOf(snapshot.values)).toBe(selection.enabled);
    }
  });
});

describe('the rule table, edit by edit', () => {
  const vanillaPair = selectionOf(true, 'capacity', 'vanilla', 'custom');

  it('pushes a Vanilla family into the pool when the pond leaves its legacy mode, and leaves Custom alone', () => {
    const settled = reconcileCapacityPond({ ...vanillaPair, pond: pondSettingForMode('gamble', LEGACY_POND_SETTING) }, 'pond');
    expect(settled.capacity.explosives.mode).toBe('vanilla-in-pool');
    expect(settled.capacity.projectiles.mode).toBe('custom');
    expect(settled.pond.mode).toBe('gamble');
    expect(settled.pondModes).not.toContain('capacity');
    expect(settled.notes.length).toBe(2);
  });

  it('pushes the pond off its legacy mode when a family goes into the pool', () => {
    const capacity = { ...vanillaPair.capacity, explosives: { mode: 'vanilla-in-pool' } as FamilySetting };
    const settled = reconcileCapacityPond({ ...vanillaPair, capacity }, 'explosives');
    expect(settled.pond.mode).toBe('vanilla-cost');
    expect(settled.capacity.projectiles.mode).toBe('custom');
  });

  /**
   * A Custom family carries its ladder in the seed, so it asks the pond for
   * nothing: moving a row onto one must leave the pond, and the other row,
   * exactly where the player put them.
   */
  it('leaves the pond and the other family alone when a row moves to Custom', () => {
    const pooled = reconcileCapacityPond(
      { ...vanillaPair, capacity: profileOf('vanilla-in-pool', 'vanilla-in-pool'),
        pond: pondSettingForMode('gamble', LEGACY_POND_SETTING) }, 'pond');
    const capacity = { ...pooled.capacity, explosives: settingFor('custom', 10, 15) };
    const settled = reconcileCapacityPond({ ...pooled, capacity }, 'explosives');
    expect(settled.pond.mode).toBe('gamble');
    expect(settled.capacity.projectiles.mode).toBe('vanilla-in-pool');
    expect(settled.pondModes).not.toContain('capacity');
  });

  it('gives the pond its legacy mode back when the last family leaves the pool', () => {
    const pooled = reconcileCapacityPond(
      { ...vanillaPair, capacity: profileOf('custom', 'vanilla-in-pool'),
        pond: pondSettingForMode('gamble', LEGACY_POND_SETTING) }, 'pond');
    const capacity = { ...pooled.capacity, projectiles: settingFor('vanilla', 30, 35) };
    const settled = reconcileCapacityPond({ ...pooled, capacity }, 'projectiles');
    expect(settled.pond.mode).toBe('capacity');
    expect(settled.capacity.explosives.mode).toBe('custom');
    expect(settled.pondModes).toContain('capacity');
    expect(settled.notes).toEqual([]);
  });
});

describe('retro bow pins the projectiles family', () => {
  const pair = selectionOf(true, 'capacity', 'vanilla', 'custom', true);

  it('reads the family as Vanilla with the reason on its card, whatever was stored', () => {
    for (const mode of FAMILY_MODES) {
      const capacity = { ...pair.capacity, projectiles: settingFor(mode, 30, 35) };
      const settled = reconcileCapacityPond({ ...pair, capacity }, 'projectiles');
      expect(settled.capacity.projectiles.mode).toBe('vanilla');
      expect(settled.forcedFamilies.get('projectiles')).toContain('retro bow');
      expect(settled.forcedFamilies.has('explosives')).toBe(false);
    }
  });

  it('lets the pond sell throws on the explosives family alone, never pulling the projectiles back in', () => {
    const settled = reconcileCapacityPond({ ...pair, pond: pondSettingForMode('gamble', LEGACY_POND_SETTING) }, 'pond');
    expect(settled.pond.mode).toBe('gamble');
    expect(settled.capacity.explosives.mode).toBe('vanilla-in-pool');
    expect(settled.capacity.projectiles.mode).toBe('vanilla');
    // The explosives family on its own ladder needs nothing from the pond, and
    // the projectiles are out of the pair under retro, so the mode the player
    // picked stands.
    const capacity = { ...settled.capacity, explosives: settingFor('custom', 10, 15) };
    expect(reconcileCapacityPond({ ...settled, capacity }, 'explosives').pond.mode).toBe('gamble');
  });

  it('hands the row back when retro goes off', () => {
    const settled = reconcileCapacityPond({ ...pair, retroBow: false }, 'pond');
    expect(settled.capacity.projectiles.mode).toBe('custom');
    expect(settled.forcedFamilies.size).toBe(0);
  });

  it('reads an old snapshot with both on as vanilla projectiles', () => {
    const snapshot = buildOptionsSnapshot(randomizerChoiceOverrides({
      ...BASE_CHOICES, capacityEnabled: true, capacity: pair.capacity, pond: pair.pond, retroBow: defaultRetroBow(),
    }));
    const values = { ...snapshot.values, capacity_projectiles_mode: 'vanilla-in-pool', retro_bow: true };
    expect(capacityProfileFromSnapshot({ ...snapshot, values }).projectiles.mode).toBe('vanilla');
  });
});

describe('a snapshot written before the master switch existed', () => {
  it('reads as the feature being on, so its placement keeps its meaning', () => {
    expect(capacityEnabledOf({})).toBe(true);
    expect(capacityEnabledOf({ capacity_upgrades_enabled: true })).toBe(true);
    expect(capacityEnabledOf({ capacity_upgrades_enabled: false })).toBe(false);
  });
});
