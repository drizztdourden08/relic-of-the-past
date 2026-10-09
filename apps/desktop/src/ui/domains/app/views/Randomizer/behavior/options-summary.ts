/* @layer renderer-components @kind logic */
import { optionCatalog } from '@shared/randomizer/world/options.data';
import { darkRoomSettingOfValues } from '@shared/randomizer/world/dark-rooms/dark-room-from-snapshot';
import { DARK_ROOM_LIGHT_FIELDS } from '@shared/randomizer/world/dark-rooms/dark-room-lights.data';
import { dungeonItemSettingFromSnapshot } from '@shared/randomizer/world/dungeon-items/dungeon-item-from-snapshot';
import { parsePondProfiles } from '@shared/randomizer/world/pond/pond-profiles-from-snapshot';
import { POND_IDS } from '@shared/randomizer/world/pond/pond-instances';
import { PROGRESSIVE_FAMILIES } from '@shared/randomizer/world/progressive/progressive-families.data';
import { progressiveSettingOfValues } from '@shared/randomizer/world/progressive/progressive-from-snapshot';
import { tickedCountOf } from '@shared/randomizer/world/progressive/progressive-reach';
import { storyGateValuesOf, storyGatesOfValues } from '@shared/randomizer/world/story-gates/story-gate-from-snapshot';
import { DEFAULT_STORY_GATES } from '@shared/randomizer/world/story-gates/story-gates.data';
import { isChanged } from '@app/hooks/randomizer/option-tab-model';
import { scopeFlagsOf } from './scope-flags';
import { LEGACY_POND_MODE } from './options-summary.constants';
import type { RandomizerOptionsSnapshot } from '@shared/randomizer/world/options.type';
import type { OptionsSummary, SnapshotValues, Tally } from './options-summary.type';

const tallyOf = (flags: readonly boolean[]): Tally =>
  ({ count: flags.filter(Boolean).length, total: flags.length });

const changedOf = (values: SnapshotValues): Tally => tallyOf(optionCatalog
  .filter((option) => !option.locked)
  .map((option) => isChanged(option, values[option.key])));

const storyGatesChangedOf = (values: SnapshotValues): Tally => {
  const stored = storyGateValuesOf(storyGatesOfValues(values));
  const told = storyGateValuesOf(DEFAULT_STORY_GATES);
  return tallyOf(Object.keys(told).map((key) => String(stored[key]) !== String(told[key])));
};

const rungsOf = (values: SnapshotValues): Tally => {
  const setting = progressiveSettingOfValues(values);
  return {
    count: PROGRESSIVE_FAMILIES.reduce((sum, family) => sum + tickedCountOf(setting, family.id), 0),
    total: PROGRESSIVE_FAMILIES.reduce((sum, family) => sum + family.tiers.length, 0),
  };
};

const optionsSummaryOf = (snapshot: RandomizerOptionsSnapshot, profileSeed: string): OptionsSummary => {
  const { values } = snapshot;
  const scopeFlags = scopeFlagsOf(values, profileSeed);
  const darkRooms = darkRoomSettingOfValues(values);
  const ponds = parsePondProfiles(values).profiles;
  return {
    changed: changedOf(values),
    scopes: tallyOf(scopeFlags.map((flag) => flag.on)),
    scopeFlags,
    dungeonItems: tallyOf(Object.values(dungeonItemSettingFromSnapshot(snapshot))
      .map((mode) => mode !== 'original_dungeon')),
    rungs: rungsOf(values),
    storyGates: storyGatesChangedOf(values),
    lights: tallyOf(DARK_ROOM_LIGHT_FIELDS.map((field) => darkRooms.lights[field])),
    lightRequired: darkRooms.requireLight,
    ponds: tallyOf(POND_IDS.map((id) => ponds[id].mode !== LEGACY_POND_MODE)),
  };
};

export { optionsSummaryOf };
