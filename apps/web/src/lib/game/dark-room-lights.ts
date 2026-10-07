/* @layer bridge-wasm @kind logic */
/**
 * The dark-room lights as gate bits: the share of gate word 4 (features.h
 * kFeatures4_*) that says which carried items light an unlit room.
 *
 * Three bits, not four: the lamp lights a room in the unmodified game and is
 * never taken away, so it carries no bit. A seed that unticks it is only
 * telling the fill not to COUNT on it, and a file that finds one anyway is
 * strictly better off than the rules assumed, which can never make a seed
 * unbeatable.
 *
 * Ticking a light is possession and nothing else: the core hooks the game's
 * own "is a light carried" seam, so a ticked item lights a room for free at
 * any meter, exactly as the lamp does (core/game-hooks/dark_room_lights.c).
 * That is why there is no cost, mode or amount to arm here, only the set.
 *
 * "Dark rooms need a light" is not read here. It tells the fill whether a
 * dark room needs a light, and turning it off never puts out a ticked light:
 * lighting a room the rules already treat as passable can only help a seed.
 *
 * The word itself is written by item-power.ts, which owns word 4 outright; the
 * two halves are OR'd there so a session makes one write.
 */

import type { DarkRoomSetting } from '@shared/randomizer/ap-world/dark-rooms/dark-room.type';

/** features.h kFeatures4_*: keep in lockstep with that enum. */
const DARK_ROOM_LIGHT_BIT = {
  rod: 1024,
  medallion: 2048,
  redCane: 4096,
} as const;

/** The bits a setting asks for; zero leaves the lamp as the only light. */
const darkRoomLightWordOf = (setting: DarkRoomSetting): number => {
  // The requirement is read by the seed logic alone. A ticked light lights a
  // room with it on or off, so only the ticks decide the bits.
  let word = 0;
  if (setting.lights.fireRod) word |= DARK_ROOM_LIGHT_BIT.rod;
  if (setting.lights.bombos) word |= DARK_ROOM_LIGHT_BIT.medallion;
  if (setting.lights.redCane) word |= DARK_ROOM_LIGHT_BIT.redCane;
  return word;
};

export { DARK_ROOM_LIGHT_BIT, darkRoomLightWordOf };
