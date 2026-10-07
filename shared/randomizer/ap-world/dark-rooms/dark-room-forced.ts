/* @layer shared-game @kind logic */
/**
 * Which light tiles the scope switch has taken out of the player's hands, and
 * the one sentence that says why. The generator, the gate word and the panel
 * all read through this rule (dark-room-from-snapshot.ts applies it to every
 * stored reading), so a tile can never show one thing while the seed is built
 * with another.
 *
 * The first medallion is the one light this covers. In the unmodified game it
 * stands on a tablet in the desert, and the whole world past the opening is
 * behind the unlit rooms of the escape, so nothing before those rooms could
 * ever hold it. Only the standing-item shuffle moves it off the tablet. With
 * that shuffle off, a seed that counted it as a light would need it before
 * any place it could be put, and no seed can roll. With the shuffle on it is
 * a pool item like the rest and the fill places it in the rooms ahead of the
 * escape, which is exactly what the sweeps show.
 *
 * A MASK, not a rewrite: the stored answer is kept underneath, so ticking the
 * shuffle back on hands the tile straight back.
 */
import { DARK_ROOM_LIGHT_FIELDS } from './dark-room-lights.data';
import type { DarkRoomLightField, DarkRoomLights } from './dark-room.type';

/** The lights a seed can only count on with the standing world items shuffled. */
const LIGHTS_BEHIND_WORLD_SHUFFLE: readonly DarkRoomLightField[] = ['bombos'];

/** The sentence a masked tile carries; the tile itself names the item. */
const WORLD_SHUFFLE_REASON = 'is off until standing world items are shuffled';

/** The masked tiles, each with its reason. Empty while the world items shuffle. */
const forcedDarkRoomLightReasons = (
  includeWorldItems: boolean,
): ReadonlyMap<DarkRoomLightField, string> => new Map(
  includeWorldItems ? [] : LIGHTS_BEHIND_WORLD_SHUFFLE.map((field) => [field, WORLD_SHUFFLE_REASON]),
);

/** The lights as the seed reads them: every masked tile off, the rest as stored. */
const maskDarkRoomLights = (lights: DarkRoomLights, includeWorldItems: boolean): DarkRoomLights => {
  const forced = forcedDarkRoomLightReasons(includeWorldItems);
  if (forced.size === 0) return lights;
  return Object.fromEntries(DARK_ROOM_LIGHT_FIELDS.map((field) =>
    [field, forced.has(field) ? false : lights[field]])) as unknown as DarkRoomLights;
};

export { LIGHTS_BEHIND_WORLD_SHUFFLE, WORLD_SHUFFLE_REASON, forcedDarkRoomLightReasons, maskDarkRoomLights };
