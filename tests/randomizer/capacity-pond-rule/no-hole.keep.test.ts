/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { POND_FED_FAMILIES, reconcileCapacityPond } from '@shared/randomizer/world/capacity-pond';
import {
  capacityEnabledOf, capacityProfileFromSnapshot,
} from '@shared/randomizer/world/capacity/capacity-profile-from-snapshot';
import { pondSettingFromSnapshot } from '@shared/randomizer/world/pond/pond-from-snapshot';
import { pondSettingForMode } from '@shared/randomizer/world/pond/pond-mode-switch';
import { defaultRetroBow } from '@shared/randomizer/world/retro/retro-from-snapshot';
import { LEGACY_POND_PROFILES, LEGACY_POND_SETTING } from '@shared/randomizer/world/pond/pond-profile-defaults';
import { buildOptionsSnapshot } from '@shared/randomizer/options-snapshot';
import { randomizerChoiceOverrides } from '@app/hooks/randomizer/randomizer-choices';
import { AUTHORITIES, BASE_CHOICES, FAMILY_MODES } from './capacity-pond-rule.constants';
import { bothHaveSource } from './both-have-source';
import { combinations } from './combinations';
import { settingFor } from './setting-for';

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
        ...BASE_CHOICES, capacityEnabled: selection.enabled, capacity: selection.capacity,
        ponds: { ...LEGACY_POND_PROFILES, capacity: selection.pond },
        retroBow: { ...defaultRetroBow(), enabled: selection.retroBow },
      }));
      const capacity = capacityProfileFromSnapshot(snapshot);
      const pond = pondSettingFromSnapshot(snapshot);
      expect(bothHaveSource(capacity, pond, selection.retroBow), JSON.stringify(snapshot.values)).toBe(true);
      expect(capacityEnabledOf(snapshot.values)).toBe(selection.enabled);
    }
  });
});
