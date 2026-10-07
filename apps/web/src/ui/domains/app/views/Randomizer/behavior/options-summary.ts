/* @layer renderer-components @kind logic */
/**
 * The big picture of a frozen option snapshot, as counts: how many of the
 * player's settings moved off their default, which shuffle scopes are on,
 * and how far each block (dungeon items, progressive rungs, story gates, dark
 * rooms, fairy ponds) departs from the game as shipped. Every block is read
 * with the reader the generator itself uses, so a count here describes the
 * seed that was rolled, never the current baselines.
 */
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
import type { OptionValue, RandomizerOptionsSnapshot } from '@shared/randomizer/world/options.type';
import type { OptionsSummary, Tally } from './options-summary.type';

type Values = Readonly<Record<string, OptionValue>>;

/** A pond in this mode leaves the pond as the capacity families describe it. */
const LEGACY_POND_MODE = 'capacity';

const tallyOf = (flags: readonly boolean[]): Tally =>
  ({ count: flags.filter(Boolean).length, total: flags.length });

/** Every option the player could set at creation, and whether it left its default: the tab badges' own test. */
const changedOf = (values: Values): Tally => tallyOf(optionCatalog
  .filter((option) => !option.locked)
  .map((option) => isChanged(option, values[option.key])));

const storyGatesChangedOf = (values: Values): Tally => {
  const stored = storyGateValuesOf(storyGatesOfValues(values));
  const told = storyGateValuesOf(DEFAULT_STORY_GATES);
  return tallyOf(Object.keys(told).map((key) => String(stored[key]) !== String(told[key])));
};

const rungsOf = (values: Values): Tally => {
  const setting = progressiveSettingOfValues(values);
  return {
    count: PROGRESSIVE_FAMILIES.reduce((sum, family) => sum + tickedCountOf(setting, family.id), 0),
    total: PROGRESSIVE_FAMILIES.reduce((sum, family) => sum + family.tiers.length, 0),
  };
};

/** |seed| is the profile's own, which a random shop scope drew its shelves from. */
const optionsSummaryOf = (snapshot: RandomizerOptionsSnapshot, seed: string): OptionsSummary => {
  const { values } = snapshot;
  const scopeFlags = scopeFlagsOf(values, seed);
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
