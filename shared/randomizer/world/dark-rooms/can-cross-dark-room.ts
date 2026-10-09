/* @layer shared-game @kind logic */
import { DARK_ROOM_LIGHT_FIELDS, DARK_ROOM_LIGHT_ITEMS } from './dark-room-lights.data';
import { compileRule } from '../rules/rule-eval';
import { all, any, countGroup, option } from '../rules/rule-node-build';
import type { DarkRoomLightField } from './dark-room.type';
import type { Rule } from '../world.type';
import type { RuleNode, RuleOptionKey } from '../rules/rule-node.type';

const lightKey = (field: DarkRoomLightField): RuleOptionKey => `darkRooms.light.${field}`;

const carriesLight = (field: DarkRoomLightField): RuleNode => countGroup([DARK_ROOM_LIGHT_ITEMS[field]], 1);

const canCrossDarkRoom: Rule = compileRule(any(
  option('darkRooms.requireLight', false),
  all(...DARK_ROOM_LIGHT_FIELDS.map((field) => option(lightKey(field), false))),
  any(...DARK_ROOM_LIGHT_FIELDS.map((field) => all(option(lightKey(field), true), carriesLight(field)))),
));

export { canCrossDarkRoom };
