/* @layer shared-game @kind logic */
/**
 * THE dark-room question, asked in one place: may this file cross an unlit
 * room? Every dark spot in the rule tables (rules/tables/lamps.data.ts) is
 * registered with this one predicate, so the settings are read once and no
 * spot can be left behind on a hardcoded item check.
 *
 * Three readings collapse into it, in this order:
 *  - light not required: the room is passable in the dark, so the rule is
 *    open and the seed may send the player through blind;
 *  - light required but no light accepted: a requirement nothing can ever
 *    meet would leave the rooms behind it unreachable and no seed could be
 *    rolled, so an empty set reads as "no light required" instead of as a
 *    dead end. It is a mask, not a rewrite: ticking a light back on gives
 *    the requirement straight back;
 *  - otherwise, one accepted light has to be CARRIED. Nothing more.
 *
 * Carried is the whole test for all four, which is why this reads the raw
 * count instead of state.has. The core lights a room on possession alone
 * (core/game-hooks/dark_room_lights.c hooks the game's own lamp-ownership
 * seam), so no light costs the meter and none of them is withheld on the
 * meter's empty rung. A rule that asked for usability here would be stricter
 * than the game it is describing, and a rule stricter than the game only ever
 * hides seeds that were fine.
 */
import {
  DARK_ROOM_LIGHT_FIELDS, DARK_ROOM_LIGHT_ITEMS, REFERENCE_DARK_ROOM_SETTING,
} from './dark-room-lights.data';
import { compileRule } from '../rules/rule-eval';
import { all, any, countGroup, option } from '../rules/rule-node-build';
import type { DarkRoomLightField, DarkRoomSetting } from './dark-room.type';
import type { World, Rule } from '../world.type';
import type { RuleNode, RuleOptionKey } from '../rules/rule-node.type';

/** A world built before the settings existed reads as the reference default. */
const darkRoomSettingOf = (world: World): DarkRoomSetting =>
  world.options.darkRooms ?? REFERENCE_DARK_ROOM_SETTING;

const acceptedLightsOf = (setting: DarkRoomSetting): readonly DarkRoomLightField[] =>
  DARK_ROOM_LIGHT_FIELDS.filter((field) => setting.lights[field]);

const lightKey = (field: DarkRoomLightField): RuleOptionKey => `darkRooms.light.${field}`;

/** Carried, read raw: possession alone lights the room. */
const carriesLight = (field: DarkRoomLightField): RuleNode => countGroup([DARK_ROOM_LIGHT_ITEMS[field]], 1);

/**
 * The three readings in order: no light required; no light accepted (a mask, read as none
 * required); otherwise one accepted light carried.
 */
const canCrossDarkRoom: Rule = compileRule(any(
  option('darkRooms.requireLight', false),
  all(...DARK_ROOM_LIGHT_FIELDS.map((field) => option(lightKey(field), false))),
  any(...DARK_ROOM_LIGHT_FIELDS.map((field) => all(option(lightKey(field), true), carriesLight(field)))),
));

export { acceptedLightsOf, canCrossDarkRoom, darkRoomSettingOf };
