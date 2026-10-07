/* @layer shared-game @kind data */
/**
 * The five dark-room rows of the option catalog: synthetic, unlocked, group
 * 'world', so they list beside the other world settings on the general tab
 * and wear the same row as every other toggle. They replace the reference's
 * single three-way choice (which stays in the catalog, locked, as the
 * transcription of its dataclass): the requirement row covers its "none"
 * value, and the four light rows cover the rest.
 *
 * Every baseline is the fresh-profile reading (dark-room-lights.data.ts):
 * light required, and every one of the four lights provides it. Descriptions
 * merge in from options-descriptions.data.ts like every other row.
 */
import { itemPhrase } from '../display-names/item-display-name';
import {
  DARK_ROOM_LIGHT_FIELDS, DARK_ROOM_LIGHT_ITEMS, DEFAULT_DARK_ROOM_SETTING,
} from './dark-room-lights.data';
import { DARK_ROOM_REQUIRED_KEY, darkRoomLightKeyOf } from './dark-room-option-keys';
import type { ApOptionDef } from '../options.type';
import type { DarkRoomLightField } from './dark-room.type';

type Seed = Omit<ApOptionDef, 'description'>;

const base = {
  group: 'world' as const,
  kind: 'toggle' as const,
  implementation: 'active' as const,
  locked: false,
  synthetic: true,
};

/**
 * The wording a row falls back to when the record set is not on disk. With it
 * there, the row is titled with the item's own name instead
 * (display-names/), the same lookup the tiles under the row already use, so
 * the heading and the art can never disagree about what a light is called.
 */
const NEUTRAL_LIGHT_NAMES: Readonly<Record<DarkRoomLightField, string>> = {
  lamp: 'Lamp lights a dark room',
  fireRod: 'Fire rod lights a dark room',
  bombos: 'Bombos lights a dark room',
  redCane: 'Red cane lights a dark room',
};

const lightNameOf = (field: DarkRoomLightField): string => itemPhrase(
  DARK_ROOM_LIGHT_ITEMS[field], NEUTRAL_LIGHT_NAMES[field], (name) => `${name} lights a dark room`,
);

const lightSeed = (field: DarkRoomLightField): Seed => ({
  ...base,
  key: darkRoomLightKeyOf(field),
  displayName: lightNameOf(field),
  apDefault: DEFAULT_DARK_ROOM_SETTING.lights[field],
  baseline: DEFAULT_DARK_ROOM_SETTING.lights[field],
});

const DARK_ROOM_OPTION_SEEDS: readonly Seed[] = [
  {
    ...base,
    key: DARK_ROOM_REQUIRED_KEY,
    displayName: 'Dark rooms need a light',
    apDefault: DEFAULT_DARK_ROOM_SETTING.requireLight,
    baseline: DEFAULT_DARK_ROOM_SETTING.requireLight,
  },
  ...DARK_ROOM_LIGHT_FIELDS.map(lightSeed),
];

export { DARK_ROOM_OPTION_SEEDS };
