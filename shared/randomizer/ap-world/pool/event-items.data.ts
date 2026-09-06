/* @layer shared-game @kind data */
/**
 * Event location → event item pairs, ported from Archipelago worlds/alttp/
 * ItemPool.py generate_itempool (event_pairs, lines 264-278) plus the goal
 * item pushed onto the final fight's location (lines 249-250). The prize
 * pool is the ten crystal/pendant items placed on the ten dungeon prize
 * locations (AP world pre_fill in worlds/alttp/__init__.py, not part of
 * the fixture set; transcribed from Items.py item_table's Crystal rows).
 */

const VICTORY_ITEM = 'Triforce';

const EVENT_ITEMS: ReadonlyMap<string, string> = new Map([
  ['Ganon', VICTORY_ITEM],
  ['Agahnim 1', 'Beat Agahnim 1'],
  ['Agahnim 2', 'Beat Agahnim 2'],
  ['Dark Blacksmith Ruins', 'Pick Up Purple Chest'],
  ['Frog', 'Get Frog'],
  ['Missing Smith', 'Return Smith'],
  ['Floodgate', 'Open Floodgate'],
  ['Flute Activation Spot', 'Activated Flute'],
  ['Capacity Upgrade Shop', 'Capacity Upgrade Shop'],
]);

const PRIZE_ITEMS: readonly string[] = [
  'Green Pendant',
  'Blue Pendant',
  'Red Pendant',
  'Crystal 1',
  'Crystal 2',
  'Crystal 3',
  'Crystal 4',
  'Crystal 5',
  'Crystal 6',
  'Crystal 7',
];

export { VICTORY_ITEM, EVENT_ITEMS, PRIZE_ITEMS };
