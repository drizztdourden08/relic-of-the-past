/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { reconcileCapacityPond } from '@rotp/randomizer';
import { capacityEnabledOf, capacityProfileFromSnapshot } from '@rotp/randomizer';
import { pondSettingForMode } from '@rotp/randomizer';
import { defaultRetroBow } from '@rotp/randomizer';
import { LEGACY_POND_PROFILES, LEGACY_POND_SETTING } from '@rotp/randomizer';
import { buildOptionsSnapshot } from '@rotp/randomizer';
import { randomizerChoiceOverrides } from '@app/hooks/randomizer/randomizer-choices';
import { BASE_CHOICES, FAMILY_MODES } from './capacity-pond-rule.constants';
import { selectionOf } from './selection-of';
import { settingFor } from './setting-for';

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
    const settled = reconcileCapacityPond({ ...pair, pond: pondSettingForMode('custom', LEGACY_POND_SETTING) }, 'pond');
    expect(settled.pond.mode).toBe('custom');
    expect(settled.capacity.explosives.mode).toBe('vanilla-in-pool');
    expect(settled.capacity.projectiles.mode).toBe('vanilla');
    const capacity = { ...settled.capacity, explosives: settingFor('custom', 10, 15) };
    expect(reconcileCapacityPond({ ...settled, capacity }, 'explosives').pond.mode).toBe('custom');
  });

  it('hands the row back when retro goes off', () => {
    const settled = reconcileCapacityPond({ ...pair, retroBow: false }, 'pond');
    expect(settled.capacity.projectiles.mode).toBe('custom');
    expect(settled.forcedFamilies.size).toBe(0);
  });

  it('reads an old snapshot with both on as vanilla projectiles', () => {
    const snapshot = buildOptionsSnapshot(randomizerChoiceOverrides({
      ...BASE_CHOICES, capacityEnabled: true, capacity: pair.capacity,
      ponds: { ...LEGACY_POND_PROFILES, capacity: pair.pond }, retroBow: defaultRetroBow(),
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
