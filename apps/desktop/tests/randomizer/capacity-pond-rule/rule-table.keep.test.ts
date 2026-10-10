/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { reconcileCapacityPond, pondSettingForMode, LEGACY_POND_SETTING } from '@rotp/randomizer';
import type { FamilySetting } from '@rotp/randomizer';
import { profileOf } from './profile-of';
import { selectionOf } from './selection-of';
import { settingFor } from './setting-for';

describe('the rule table, edit by edit', () => {
  const vanillaPair = selectionOf(true, 'capacity', 'vanilla', 'custom');

  it('pushes a Vanilla family into the pool when the pond leaves its legacy mode, and leaves Custom alone', () => {
    const settled = reconcileCapacityPond({ ...vanillaPair, pond: pondSettingForMode('custom', LEGACY_POND_SETTING) }, 'pond');
    expect(settled.capacity.explosives.mode).toBe('vanilla-in-pool');
    expect(settled.capacity.projectiles.mode).toBe('custom');
    expect(settled.pond.mode).toBe('custom');
    expect(settled.pondModes).not.toContain('capacity');
    expect(settled.notes.length).toBe(2);
  });

  it('pushes the pond off its legacy mode when a family goes into the pool', () => {
    const capacity = { ...vanillaPair.capacity, explosives: { mode: 'vanilla-in-pool' } as FamilySetting };
    const settled = reconcileCapacityPond({ ...vanillaPair, capacity }, 'explosives');
    expect(settled.pond.mode).toBe('vanilla-cost');
    expect(settled.capacity.projectiles.mode).toBe('custom');
  });

  it('leaves the pond and the other family alone when a row moves to Custom', () => {
    const pooled = reconcileCapacityPond(
      { ...vanillaPair, capacity: profileOf('vanilla-in-pool', 'vanilla-in-pool'),
        pond: pondSettingForMode('custom', LEGACY_POND_SETTING) }, 'pond');
    const capacity = { ...pooled.capacity, explosives: settingFor('custom', 10, 15) };
    const settled = reconcileCapacityPond({ ...pooled, capacity }, 'explosives');
    expect(settled.pond.mode).toBe('custom');
    expect(settled.capacity.projectiles.mode).toBe('vanilla-in-pool');
    expect(settled.pondModes).not.toContain('capacity');
  });

  it('gives the pond its legacy mode back when the last family leaves the pool', () => {
    const pooled = reconcileCapacityPond(
      { ...vanillaPair, capacity: profileOf('custom', 'vanilla-in-pool'),
        pond: pondSettingForMode('custom', LEGACY_POND_SETTING) }, 'pond');
    const capacity = { ...pooled.capacity, projectiles: settingFor('vanilla', 30, 35) };
    const settled = reconcileCapacityPond({ ...pooled, capacity }, 'projectiles');
    expect(settled.pond.mode).toBe('capacity');
    expect(settled.capacity.explosives.mode).toBe('custom');
    expect(settled.pondModes).toContain('capacity');
    expect(settled.notes).toEqual([]);
  });
});
