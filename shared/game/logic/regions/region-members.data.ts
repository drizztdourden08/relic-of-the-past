/* @layer shared-game @kind data */
/**
 * Which region each real overworld screen belongs to, for the tracker's logic. The dataset holds
 * the reference randomizer's regions as screens of their own (Light World, East Dark World, the
 * ledges and mountain levels) and joins them with the rules that move between them; a real
 * overworld screen is where a check sits. This table puts every real screen inside the region a
 * player walks it from, so reaching the region reaches the screen and nothing else does.
 *
 * A real screen that a region already reaches through a rule of its own (Turtle Rock's screen,
 * the mirror landings) is left out on purpose: a free membership edge would bypass that rule.
 * Screens that hold more than one level (the mountain, the lake shore) belong to the level a
 * player arrives on; a check on the other level carries its own rule.
 */
import type { ScreenId } from '@shared/game/data/types';

const s = (n: number): ScreenId => `screen-${String(n).padStart(3, '0')}` as ScreenId;

/** Region screen -> the real overworld screens inside it. */
const REGION_MEMBERS: Readonly<Record<ScreenId, readonly ScreenId[]>> = {
  // Light World: everything a player walks to once the rain has stopped.
  [s(26)]: [
    28, 43, 29, 44, 30, // Lost Woods and its outskirts
    45, 53, 31, 46, 54, 32, 47, 55, 33, 48, // Kakariko and the smithy
    51, 52, 92, // the lumberjacks, the mountain gateway, the waterfall's outskirts (the river beyond needs flippers or a glove)
    61, 69, 77, 85, 62, 70, 78, 63, 71, 79, // the Sanctuary grounds, the graveyard, the river, the castle grounds
    93, 86, 94, 87, 95, 88, 96, // Zora's ridge and the eastern ruins (the bridge needs flippers)
    34, 49, 35, 50, 58, // the desert
    65, 73, 81, 89, 66, 74, 82, 90, 98, 97, // the wetlands, Lake Hylia's shores, the frosty caves
    56, 64, 72, 57, // the haunted grove, Link's house
  ].map(s),
  // The mountain: the level a player arrives on from the entrance cave.
  [s(4)]: [59, 67, 60, 68].map(s),          // Death Mountain (west)
  [s(16)]: [75, 83, 76, 84].map(s),         // East Death Mountain (bottom)
  [s(254)]: [91].map(s),                    // the summit's east ledge (Mimic Cave)
  // Dark World regions.
  [s(252)]: [280, 288, 296, 281, 289, 297, 304, 312, 305, 313, 298, 306, 314].map(s), // East Dark World: the pyramid, the maze, the lake's east shore
  [s(255)]: [311, 295, 303].map(s),         // Northeast Dark World: the dark river, the potion shop
  [s(231)]: [310].map(s),                   // Catfish
  [s(260)]: [269, 246, 263, 271, 279, 287, 247, 264, 272, 248, 265, 273].map(s), // West Dark World: the village, the dark sanctuary, the dark lumberjack
  [s(259)]: [274, 282, 290, 275, 283, 291, 284, 249, 266, 292, 300, 308].map(s), // South Dark World: the grove, the bomb shop, the wetlands, the swamp palace grounds, the lake's south shore
  [s(240)]: [299, 307, 315].map(s),         // Dark Lake Hylia
  [s(242)]: [316].map(s),                   // Dark Lake Hylia Ledge
  [s(238)]: [250, 267, 251, 268, 276].map(s), // Dark Desert
  [s(257)]: [244, 261, 245, 262].map(s),    // Skull Woods Forest
  [s(237)]: [277, 285, 278, 286].map(s),    // Dark Death Mountain (west, bottom)
  [s(233)]: [293, 301, 294, 302].map(s),    // Dark Death Mountain (east, bottom)
};

export { REGION_MEMBERS };
