/* @layer shared-game @kind logic */
/**
 * The dark-room rows ⇄ the setting they stand for, both directions in one
 * file so the reading the generator uses and the writing the creation form
 * freezes can never spell the same option two ways.
 *
 * A snapshot frozen before these rows existed carries none of them, and an
 * absent key falls back to the reference reading (light required, lamp only)
 * — the rule every stored placement was generated under, so an old profile
 * keeps playing exactly as it was rolled.
 *
 * The reading is masked by the scope switch (dark-room-forced.ts): a light
 * the seed could not count on without the standing world items shuffled reads
 * as unticked whatever the row stores, so a snapshot that ticked it with the
 * shuffle off rolls, and arms the core, exactly as if it had not.
 */
import { DARK_ROOM_LIGHT_FIELDS, REFERENCE_DARK_ROOM_SETTING } from './dark-room-lights.data';
import { maskDarkRoomLights } from './dark-room-forced';
import { DARK_ROOM_REQUIRED_KEY, darkRoomLightKeyOf } from './dark-room-option-keys';
import { includeWorldItemsOf } from '../scope-option-keys';
import type { ApOptionValue, RandomizerOptionsSnapshot } from '../options.type';
import type { DarkRoomLights, DarkRoomSetting } from './dark-room.type';

type Values = Readonly<Record<string, ApOptionValue>>;

const flagOf = (values: Values, key: string, fallback: boolean): boolean =>
  (typeof values[key] === 'boolean' ? values[key] : fallback);

const darkRoomSettingOfValues = (values: Values): DarkRoomSetting => {
  const stored = Object.fromEntries(DARK_ROOM_LIGHT_FIELDS.map((field) =>
    [field, flagOf(values, darkRoomLightKeyOf(field), REFERENCE_DARK_ROOM_SETTING.lights[field])],
  )) as unknown as DarkRoomLights;
  return {
    requireLight: flagOf(values, DARK_ROOM_REQUIRED_KEY, REFERENCE_DARK_ROOM_SETTING.requireLight),
    lights: maskDarkRoomLights(stored, includeWorldItemsOf(values)),
  };
};

const darkRoomSettingFromSnapshot = (snapshot: RandomizerOptionsSnapshot): DarkRoomSetting =>
  darkRoomSettingOfValues(snapshot.values);

/** The rows a setting freezes — what the creation form hands the catalog. */
const darkRoomValuesOf = (setting: DarkRoomSetting): Record<string, ApOptionValue> => ({
  [DARK_ROOM_REQUIRED_KEY]: setting.requireLight,
  ...Object.fromEntries(DARK_ROOM_LIGHT_FIELDS.map((field) =>
    [darkRoomLightKeyOf(field), setting.lights[field]])),
});

export { darkRoomSettingFromSnapshot, darkRoomSettingOfValues, darkRoomValuesOf };
