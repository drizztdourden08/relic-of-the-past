/* @layer shared-game @kind data */
/**
 * The screen each event lists under, by event number, resolved through the screen records from
 * the game's own numbers or the dataset's own names (generated; the places are in the generator).
 * A dungeon stage event carries no entry here and lists under its dungeon, unless it happens in
 * one room of it or on a ledge outside it; then it lists under that place.
 */
import type { ScreenId } from '@shared/game/data/types';

const EVENT_SCREENS: Readonly<Record<number, ScreenId>> = {
  0: 'screen-205', // Starting House (Intro)
  2: 'screen-133', // Jail Cell
  3: 'screen-133', // Jail Cell
  6: 'screen-103', // Sanctuary
  7: 'screen-031', // Kakariko NW
  8: 'screen-209', // Sahasrahla's Hut
  9: 'screen-209', // Sahasrahla's Hut
  10: 'screen-209', // Sahasrahla's Hut
  11: 'screen-160', // Aginah's Cave
  12: 'screen-036', // Pedestal Meadow
  13: 'screen-103', // Sanctuary
  14: 'screen-062', // Hyrule Castle NW
  15: 'screen-004', // Death Mountain
  16: 'screen-190', // Old Man Cave
  17: 'screen-080', // Eastern Ruins Bridge
  18: 'screen-031', // Kakariko NW
  19: 'screen-220', // Potion Shop
  20: 'screen-220', // Potion Shop
  21: 'screen-181', // Bat Cave (right)
  22: 'screen-223', // Blacksmiths Hut
  23: 'screen-223', // Blacksmiths Hut
  24: 'screen-031', // Kakariko NW
  25: 'screen-023', // King's Grave Area
  26: 'screen-170', // Dam
  27: 'screen-017', // East Death Mountain (Top)
  28: 'screen-110', // Final Bridge
  29: 'screen-106', // Agahnim 1
  30: 'screen-252', // East Dark World
  31: 'screen-304', // Maze of Darkness NW
  32: 'screen-304', // Maze of Darkness NW
  33: 'screen-247', // Village of Outcasts NW
  34: 'screen-253', // Hammer Peg Area
  35: 'screen-273', // Gossip Shop
  36: 'screen-223', // Blacksmiths Hut
  37: 'screen-273', // Gossip Shop
  38: 'screen-026', // Light World
  39: 'screen-259', // South Dark World
  40: 'screen-259', // South Dark World
  41: 'screen-466', // Big Bomb Shop
  42: 'screen-280', // Pyramid of Power NW
  43: 'screen-258', // Skull Woods Forest (West)
  44: 'screen-238', // Dark Desert
  45: 'screen-309', // Turtle Rock
  46: 'screen-359', // Blind's Cell
  47: 'screen-420', // Blind the Thief
  48: 'screen-277', // Ganon's Tower NW
  49: 'screen-324', // Agahnim 2
  50: 'screen-280', // Pyramid of Power NW
  51: 'screen-452', // Pyramid
  52: 'screen-452', // Pyramid
  53: 'screen-034', // Desert of Mystery NW
  54: 'screen-031', // Kakariko NW
  // Stage events that happen in one room of their dungeon list under that room, so they open
  // with it and not at the front door. Rooms by the number the game reads (event_receipts.c).
  186: 'screen-380', // Thieves' Town Attic, room 0x65
  187: 'screen-333', // Ganon's Tower Armos Knights, room 0x1C
  189: 'screen-365', // Ganon's Tower Moldorm, room 0x4D
  190: 'screen-334', // Ganon's Tower final door, room 0x1D
  // The two ledges outside Turtle Rock's side doors, reached only from inside the dungeon.
  191: 'screen-235', // Dark Death Mountain Ledge
  192: 'screen-234', // Dark Death Mountain Isolated Ledge
  220: 'screen-218', // Waterfall of Wishing
  221: 'screen-217', // Capacity Upgrade
  222: 'screen-484', // Pyramid Fairy
  223: 'screen-493', // North Fairy Cave, the room the door opens into
  224: 'screen-159', // Long Fairy Cave
  225: 'screen-186', // Hookshot Fairy
  235: 'screen-186', // Hookshot Fairy
  226: 'screen-197', // Lake Hylia Healer Fairy
  227: 'screen-188', // Swamp Healer Fairy
  228: 'screen-187', // Desert Healer Fairy
  229: 'screen-196', // Bonk Fairy (Light)
  230: 'screen-460', // Bonk Fairy (Dark)
  231: 'screen-461', // Dark Lake Hylia Healer Fairy
  232: 'screen-462', // Dark Lake Hylia Ledge Healer Fairy
  233: 'screen-456', // Dark Desert Healer Fairy
  234: 'screen-454', // Dark Death Mountain Healer Fairy
  183: 'screen-013', // Desert Palace North Spot
  184: 'screen-258', // Skull Woods Forest (West)
  240: 'screen-004', // Death Mountain
  241: 'screen-016', // East Death Mountain (Bottom)
  242: 'screen-254', // Mimic Cave Ledge
  243: 'screen-005', // Death Mountain Entrance
  244: 'screen-062', // Hyrule Castle NW
  245: 'screen-034', // Desert of Mystery NW
  246: 'screen-081', // Lake Hylia NW
  247: 'screen-036', // Pedestal Meadow
  248: 'screen-042', // Northern River
  249: 'screen-252', // East Dark World
  250: 'screen-255', // Northeast Dark World
  251: 'screen-231', // Catfish
  252: 'screen-260', // West Dark World
  253: 'screen-259', // South Dark World
  254: 'screen-240', // Dark Lake Hylia
  255: 'screen-238', // Dark Desert
  256: 'screen-257', // Skull Woods Forest
  257: 'screen-229', // Bumper Cave Entrance
  258: 'screen-237', // Dark Death Mountain West (Bottom)
  259: 'screen-233', // Dark Death Mountain East (Bottom)
  260: 'screen-309', // Turtle Rock
  261: 'screen-008', // Death Mountain Top
  262: 'screen-017', // East Death Mountain (Top)
  263: 'screen-024', // Lake Hylia Central Island
  264: 'screen-062', // Hyrule Castle NW
  265: 'screen-015', // Desert Palace Stairs
  266: 'screen-236', // Dark Death Mountain Top
  267: 'screen-256', // Pyramid Ledge
  268: 'screen-241', // Dark Lake Hylia Central Island
  290: 'screen-028', // Lost Woods NW
  291: 'screen-051', // Lumberjack Estate
  292: 'screen-031', // Kakariko NW
  293: 'screen-061', // Sanctuary Grounds
  294: 'screen-069', // Graveyard
  295: 'screen-085', // Coven of Commerce
  296: 'screen-092', // Zora Falls Outskirts
  297: 'screen-086', // Eastern Ruins NW
  298: 'screen-072', // Uncle's Estate East
  299: 'screen-056', // Haunted Grove
  300: 'screen-066', // Watergate Grounds
  301: 'screen-247', // Village of Outcasts NW
  302: 'screen-304', // Maze of Darkness NW
  303: 'screen-284', // Swamp Palace Grounds
  304: 'screen-279', // Unctuary Grounds
  305: 'screen-290', // Bomb Shop Grounds
  306: 'screen-025', // Lake Hylia Island
  307: 'screen-230', // Bumper Cave Ledge
  // The overworld acts (acts.ts), each on the screen whose own byte records it.
  310: 'screen-061', // Sanctuary Grounds
  311: 'screen-064', // Uncle's Estate West
  312: 'screen-282', // Bomb Shop Grounds West
  313: 'screen-034', // Desert of Mystery NW
  314: 'screen-293', // DW Death Mountain Bridge NW
  315: 'screen-315', // Info Hub
  316: 'screen-097', // Frosty Caves
  317: 'screen-058', // Via of Mystery
  325: 'screen-051', // Lumberjack Estate
  318: 'screen-031', // Kakariko NW
  319: 'screen-073', // Hyrule Wetlands NE
  320: 'screen-081', // Lake Hylia NW
  321: 'screen-097', // Frosty Caves
  322: 'screen-247', // Village of Outcasts NW
  323: 'screen-291', // Wilted Wetlands NE
  324: 'screen-315', // Info Hub
} as Record<number, ScreenId>;

export { EVENT_SCREENS };
