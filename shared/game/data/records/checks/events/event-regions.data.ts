/* @layer shared-game @kind data */
/**
 * The region each event sits in, by event number (generated from the reachability partition).
 *
 * An event is not a spot the seed fills, so no reference row names one. The region is the one
 * its screen carries (event-screens.data.ts), and for a dungeon stage event, which carries no
 * screen, the wing its dungeon is entered through. The one exception is number 37, a moment the
 * reference DOES hold as a location, so it keeps the region that row gives it.
 *
 * An event that stands for no place carries no entry: a held item, a status, a combined event
 * over other rows.
 */
import type { RegionId } from '@shared/game/data/types';

const EVENT_REGIONS: Readonly<Record<number, RegionId>> = {
  0: 'region-064', // Uncle leaves the house
  2: 'region-169', // Zelda's cell unlocked
  3: 'region-169', // Zelda freed
  6: 'region-174', // Intro complete
  7: 'region-002', // Kakariko kid's hint
  8: 'region-088', // Sahasrahla's quest
  9: 'region-088', // Sahasrahla marks the map
  10: 'region-088', // Sahasrahla's trial passed
  11: 'region-087', // Talked to Aginah
  12: 'region-018', // Master Sword pulled
  13: 'region-174', // Loyal Sage's last words
  14: 'region-002', // Castle barrier broken
  15: 'region-021', // Old Man found
  16: 'region-117', // Old Man rescued
  17: 'region-008', // Hobo's bottle
  18: 'region-002', // Bottle bought from the merchant
  19: 'region-112', // Witch's powder ready
  20: 'region-112', // Witch's brew collected
  21: 'region-092', // Magic Bat summoned
  22: 'region-091', // Tempering paid
  23: 'region-091', // Tempering done
  24: 'region-002', // Weathervane opened
  25: 'region-006', // King's Tomb opened
  26: 'region-063', // Floodgate lever pulled
  27: 'region-024', // Death Mountain warp pegs
  28: 'region-175', // Agahnim sends Zelda away
  29: 'region-176', // Agahnim 1 beaten
  30: 'region-034', // Dark World reached
  31: 'region-034', // Kiki hired
  32: 'region-034', // Palace of Darkness opened
  33: 'region-041', // Thieves' Town opened
  34: 'region-043', // Hammer peg field cleared
  35: 'region-041', // Frog found
  36: 'region-091', // Smiths reunited
  37: 'region-043', // Purple Chest found
  38: 'region-002', // Purple Chest opened
  39: 'region-037', // Flute boy asks for his flute
  40: 'region-037', // Stumpy at rest
  41: 'region-136', // Big Bomb bought
  42: 'region-034', // Pyramid Fairy wall blown up
  43: 'region-047', // Skull Woods back entrance burned
  44: 'region-048', // Misery Mire opened
  45: 'region-055', // Turtle Rock opened
  46: 'region-187', // Maiden freed
  47: 'region-188', // Blind revealed
  48: 'region-049', // Ganon's Tower opened
  49: 'region-239', // Agahnim 2 beaten
  50: 'region-034', // Pyramid hole opened
  51: 'region-162', // Ganon beaten
  52: 'region-162', // Game completed
  53: 'region-002', // Desert statues prayed open
  54: 'region-002', // Kakariko guards on alert
  60: 'region-168', // Eastern Palace: started
  61: 'region-168', // Eastern Palace: Big Key door unlocked
  62: 'region-168', // Eastern Palace: boss reached
  63: 'region-168', // Eastern Palace: Armos Knights beaten
  64: 'region-168', // Eastern Palace: heart container taken
  65: 'region-168', // Eastern Palace: reward taken
  66: 'region-168', // Eastern Palace: all chests opened
  67: 'region-168', // Eastern Palace: all keys collected
  68: 'region-168', // Eastern Palace: cleared
  70: 'region-167', // Desert Palace: started
  71: 'region-167', // Desert Palace: Big Key door unlocked
  72: 'region-167', // Desert Palace: boss reached
  73: 'region-167', // Desert Palace: Lanmolas beaten
  74: 'region-167', // Desert Palace: heart container taken
  75: 'region-167', // Desert Palace: reward taken
  76: 'region-167', // Desert Palace: all chests opened
  77: 'region-167', // Desert Palace: all keys collected
  78: 'region-167', // Desert Palace: cleared
  80: 'region-177', // Tower of Hera: started
  81: 'region-177', // Tower of Hera: Big Key door unlocked
  82: 'region-177', // Tower of Hera: boss reached
  83: 'region-177', // Tower of Hera: Moldorm beaten
  84: 'region-177', // Tower of Hera: heart container taken
  85: 'region-177', // Tower of Hera: reward taken
  86: 'region-177', // Tower of Hera: all chests opened
  87: 'region-177', // Tower of Hera: all keys collected
  88: 'region-177', // Tower of Hera: cleared
  90: 'region-175', // Agahnim's Tower: started
  92: 'region-175', // Agahnim's Tower: boss reached
  93: 'region-175', // Agahnim's Tower: Agahnim beaten
  94: 'region-175', // Agahnim's Tower: heart container taken
  96: 'region-175', // Agahnim's Tower: all chests opened
  97: 'region-175', // Agahnim's Tower: all keys collected
  98: 'region-175', // Agahnim's Tower: cleared
  100: 'region-220', // Palace of Darkness: started
  101: 'region-220', // Palace of Darkness: Big Key door unlocked
  102: 'region-220', // Palace of Darkness: boss reached
  103: 'region-220', // Palace of Darkness: Helmasaur King beaten
  104: 'region-220', // Palace of Darkness: heart container taken
  105: 'region-220', // Palace of Darkness: reward taken
  106: 'region-220', // Palace of Darkness: all chests opened
  107: 'region-220', // Palace of Darkness: all keys collected
  108: 'region-220', // Palace of Darkness: cleared
  110: 'region-180', // Swamp Palace: started
  112: 'region-180', // Swamp Palace: boss reached
  113: 'region-180', // Swamp Palace: Arrghus beaten
  114: 'region-180', // Swamp Palace: heart container taken
  115: 'region-180', // Swamp Palace: reward taken
  116: 'region-180', // Swamp Palace: all chests opened
  117: 'region-180', // Swamp Palace: all keys collected
  118: 'region-180', // Swamp Palace: cleared
  120: 'region-195', // Skull Woods: started
  122: 'region-195', // Skull Woods: boss reached
  123: 'region-195', // Skull Woods: Mothula beaten
  124: 'region-195', // Skull Woods: heart container taken
  125: 'region-195', // Skull Woods: reward taken
  126: 'region-195', // Skull Woods: all chests opened
  127: 'region-195', // Skull Woods: all keys collected
  128: 'region-195', // Skull Woods: cleared
  130: 'region-186', // Thieves' Town: started
  131: 'region-186', // Thieves' Town: Big Key door unlocked
  132: 'region-186', // Thieves' Town: boss reached
  133: 'region-186', // Thieves' Town: Blind beaten
  134: 'region-186', // Thieves' Town: heart container taken
  135: 'region-186', // Thieves' Town: reward taken
  136: 'region-186', // Thieves' Town: all chests opened
  137: 'region-186', // Thieves' Town: all keys collected
  138: 'region-186', // Thieves' Town: cleared
  140: 'region-197', // Ice Palace: started
  141: 'region-197', // Ice Palace: Big Key door unlocked
  142: 'region-197', // Ice Palace: boss reached
  143: 'region-197', // Ice Palace: Kholdstare beaten
  144: 'region-197', // Ice Palace: heart container taken
  145: 'region-197', // Ice Palace: reward taken
  146: 'region-197', // Ice Palace: all chests opened
  147: 'region-197', // Ice Palace: all keys collected
  148: 'region-197', // Ice Palace: cleared
  150: 'region-203', // Misery Mire: started
  151: 'region-203', // Misery Mire: Big Key door unlocked
  152: 'region-203', // Misery Mire: boss reached
  153: 'region-203', // Misery Mire: Vitreous beaten
  154: 'region-203', // Misery Mire: heart container taken
  155: 'region-203', // Misery Mire: reward taken
  156: 'region-203', // Misery Mire: all chests opened
  157: 'region-203', // Misery Mire: all keys collected
  158: 'region-203', // Misery Mire: cleared
  160: 'region-208', // Turtle Rock: started
  161: 'region-208', // Turtle Rock: Big Key door unlocked
  162: 'region-208', // Turtle Rock: boss reached
  163: 'region-208', // Turtle Rock: Trinexx beaten
  164: 'region-208', // Turtle Rock: heart container taken
  165: 'region-208', // Turtle Rock: reward taken
  166: 'region-208', // Turtle Rock: all chests opened
  167: 'region-208', // Turtle Rock: all keys collected
  168: 'region-208', // Turtle Rock: cleared
  170: 'region-228', // Ganon's Tower: started
  171: 'region-228', // Ganon's Tower: Big Key door unlocked
  172: 'region-228', // Ganon's Tower: boss reached
  173: 'region-228', // Ganon's Tower: Agahnim beaten
  174: 'region-228', // Ganon's Tower: heart container taken
  176: 'region-228', // Ganon's Tower: all chests opened
  177: 'region-228', // Ganon's Tower: all keys collected
  178: 'region-228', // Ganon's Tower: cleared
  180: 'region-169', // Hyrule Castle: started
  181: 'region-169', // Hyrule Castle: sewers reached
  182: 'region-169', // Hyrule Castle: cleared
  183: 'region-017', // Desert Palace: back section entered
  184: 'region-047', // Skull Woods: back section entered
  185: 'region-180', // Swamp Palace: past the flooded entrance
  186: 'region-187', // Thieves' Town: attic floor bombed
  187: 'region-235', // Ganon's Tower: Armos Knights rematch beaten
  188: 'region-228', // Ganon's Tower: Lanmolas rematch beaten
  189: 'region-238', // Ganon's Tower: Moldorm rematch beaten
  190: 'region-235', // Ganon's Tower: final door unlocked
  191: 'region-051', // Turtle Rock: Big Chest ledge entered from outside
  192: 'region-052', // Turtle Rock: Laser Bridge entered from outside
  193: 'region-195', // Skull Woods: front entrance 1 used
  194: 'region-195', // Skull Woods: front entrance 2 used
  195: 'region-195', // Skull Woods: front entrance 3 used
  196: 'region-195', // Skull Woods: front entrance 4 used
  197: 'region-195', // Skull Woods: front entrance 5 used
  198: 'region-180', // Swamp Palace: inner waterways entered
  220: 'region-060', // Waterfall Fairy entered
  221: 'region-113', // Hylia Fairy entered
  222: 'region-147', // Pyramid Fairy entered
  223: 'region-062', // North Fairy Cave entered
  224: 'region-102', // Long Fairy Cave entered
  225: 'region-124', // Hookshot Fairy Cave entered
  226: 'region-079', // Lake Hylia Fairy entered
  227: 'region-080', // Swamp Fairy entered
  228: 'region-081', // Desert Fairy entered
  229: 'region-077', // Bonk Fairy entered (Light World)
  230: 'region-078', // Bonk Fairy entered (Dark World)
  231: 'region-082', // Dark Lake Hylia Fairy entered
  232: 'region-083', // Dark Lake Hylia Ledge Fairy entered
  233: 'region-084', // Dark Desert Fairy entered
  234: 'region-085', // Dark Death Mountain Fairy entered
  235: 'region-124', // Hookshot Fairy Cave far side reached
  240: 'region-021', // Death Mountain reached
  241: 'region-023', // East Death Mountain reached
  242: 'region-032', // Mimic Cave ledge reached
  243: 'region-003', // Death Mountain entrance reached
  244: 'region-002', // Hyrule Castle grounds reached
  245: 'region-002', // Desert reached
  246: 'region-002', // Lake Hylia reached
  247: 'region-018', // Master Sword Meadow reached
  248: 'region-005', // Zora's Domain reached
  249: 'region-034', // East Dark World reached
  250: 'region-036', // Northeast Dark World reached
  251: 'region-035', // Catfish reached
  252: 'region-041', // West Dark World reached
  253: 'region-037', // South Dark World reached
  254: 'region-038', // Dark Lake Hylia reached
  255: 'region-048', // Dark Desert reached
  256: 'region-046', // Skull Woods forest reached
  257: 'region-044', // Bumper Cave reached
  258: 'region-049', // Dark Death Mountain west reached
  259: 'region-053', // Dark Death Mountain east reached
  260: 'region-055', // Turtle Rock top reached
  261: 'region-028', // Death Mountain top reached
  262: 'region-024', // East Death Mountain top reached
  263: 'region-004', // Lake Hylia fairy island reached
  264: 'region-002', // Hyrule Castle upper terrace reached
  265: 'region-015', // Desert Palace stairs reached
  266: 'region-050', // Dark Death Mountain top reached
  267: 'region-056', // Pyramid ledge reached
  268: 'region-039', // Dark Lake Hylia island reached
  290: 'region-002', // Lost Woods reached
  291: 'region-002', // Lumberjacks' house reached
  292: 'region-002', // Kakariko Village reached
  293: 'region-002', // Sanctuary grounds reached
  294: 'region-002', // Graveyard reached
  295: 'region-002', // Witch's hut reached
  296: 'region-002', // Path to Zora reached
  297: 'region-002', // Eastern Palace grounds reached
  298: 'region-002', // Uncle's Estate reached
  299: 'region-002', // Haunted Grove reached
  300: 'region-002', // Great Swamp reached
  301: 'region-041', // Village of Outcasts reached
  302: 'region-034', // Palace of Darkness grounds reached
  303: 'region-037', // Swamp Palace grounds reached
  304: 'region-041', // Dark Sanctuary grounds reached
  305: 'region-037', // Bomb Shop grounds reached
  306: 'region-011', // Lake Hylia heart piece island reached
  307: 'region-045', // Bumper Cave ledge reached
  310: 'region-002', // Bonk rocks smashed open
  311: 'region-002', // Bonk Fairy uncovered (Light World)
  312: 'region-037', // Bonk Fairy uncovered (Dark World)
  313: 'region-002', // Checkerboard Cave uncovered
  314: 'region-053', // Hookshot Cave uncovered
  315: 'region-038', // Dark Lake Hylia spike cave uncovered
  316: 'region-002', // 20 Rupee Cave uncovered
  317: 'region-002', // 50 Rupee Cave uncovered
  318: 'region-002', // Bomb Hut wall blown open
  319: 'region-002', // Light Hype Fairy blown open
  320: 'region-002', // Mini Moldorm Cave blown open
  321: 'region-002', // Ice Rod Cave blown open
  322: 'region-041', // Brewery blown open
  323: 'region-037', // Hype Cave blown open
  324: 'region-038', // Dark Lake Hylia healer fairy blown open
  325: 'region-002', // Lumberjack tree fallen
} as Record<number, RegionId>;

export { EVENT_REGIONS };
