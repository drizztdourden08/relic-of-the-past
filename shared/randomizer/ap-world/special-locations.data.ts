/* @layer shared-game @kind data */
/**
 * Location metadata ported from tests/fixtures/ap-source/Regions.py:
 * key_drop_data (locations that exist only with key_drop_shuffle, each
 * holding its dungeon key in vanilla), the event locations (address None in
 * location_table — they carry logic events, never pool items), and the
 * boss-prize locations (crystal flag True in location_table).
 */
const KEY_DROP_LOCATIONS: ReadonlyMap<string, string> = new Map([
  ['Hyrule Castle - Map Guard Key Drop', 'Small Key (Hyrule Castle)'],
  ['Hyrule Castle - Boomerang Guard Key Drop', 'Small Key (Hyrule Castle)'],
  ['Sewers - Key Rat Key Drop', 'Small Key (Hyrule Castle)'],
  ['Hyrule Castle - Big Key Drop', 'Big Key (Hyrule Castle)'],
  ['Eastern Palace - Dark Square Pot Key', 'Small Key (Eastern Palace)'],
  ['Eastern Palace - Dark Eyegore Key Drop', 'Small Key (Eastern Palace)'],
  ['Desert Palace - Desert Tiles 1 Pot Key', 'Small Key (Desert Palace)'],
  ['Desert Palace - Beamos Hall Pot Key', 'Small Key (Desert Palace)'],
  ['Desert Palace - Desert Tiles 2 Pot Key', 'Small Key (Desert Palace)'],
  ['Castle Tower - Dark Archer Key Drop', 'Small Key (Agahnims Tower)'],
  ['Castle Tower - Circle of Pots Key Drop', 'Small Key (Agahnims Tower)'],
  ['Swamp Palace - Pot Row Pot Key', 'Small Key (Swamp Palace)'],
  ['Swamp Palace - Trench 1 Pot Key', 'Small Key (Swamp Palace)'],
  ['Swamp Palace - Hookshot Pot Key', 'Small Key (Swamp Palace)'],
  ['Swamp Palace - Trench 2 Pot Key', 'Small Key (Swamp Palace)'],
  ['Swamp Palace - Waterway Pot Key', 'Small Key (Swamp Palace)'],
  ['Skull Woods - West Lobby Pot Key', 'Small Key (Skull Woods)'],
  ['Skull Woods - Spike Corner Key Drop', 'Small Key (Skull Woods)'],
  ['Thieves\' Town - Hallway Pot Key', 'Small Key (Thieves Town)'],
  ['Thieves\' Town - Spike Switch Pot Key', 'Small Key (Thieves Town)'],
  ['Ice Palace - Jelly Key Drop', 'Small Key (Ice Palace)'],
  ['Ice Palace - Conveyor Key Drop', 'Small Key (Ice Palace)'],
  ['Ice Palace - Hammer Block Key Drop', 'Small Key (Ice Palace)'],
  ['Ice Palace - Many Pots Pot Key', 'Small Key (Ice Palace)'],
  ['Misery Mire - Spikes Pot Key', 'Small Key (Misery Mire)'],
  ['Misery Mire - Fishbone Pot Key', 'Small Key (Misery Mire)'],
  ['Misery Mire - Conveyor Crystal Key Drop', 'Small Key (Misery Mire)'],
  ['Turtle Rock - Pokey 1 Key Drop', 'Small Key (Turtle Rock)'],
  ['Turtle Rock - Pokey 2 Key Drop', 'Small Key (Turtle Rock)'],
  ['Ganons Tower - Conveyor Cross Pot Key', 'Small Key (Ganons Tower)'],
  ['Ganons Tower - Double Switch Pot Key', 'Small Key (Ganons Tower)'],
  ['Ganons Tower - Conveyor Star Pits Pot Key', 'Small Key (Ganons Tower)'],
  ['Ganons Tower - Mini Helmasaur Key Drop', 'Small Key (Ganons Tower)'],
]);

/**
 * The two capacity-fairy slots (datapackage ids 4194334/4194335), existing
 * only while their family is not vanilla — each holding the upgrade the
 * fairy sells there in vanilla (the reference models them as the capacity
 * shop's two inventory slots: bomb upgrade left, arrow upgrade right).
 */
const CAPACITY_UPGRADE_LOCATIONS: ReadonlyMap<string, string> = new Map([
  ['Capacity Upgrade Left', 'Bomb Upgrade (+5)'],
  ['Capacity Upgrade Right', 'Arrow Upgrade (+5)'],
]);

const EVENT_LOCATIONS: ReadonlySet<string> = new Set([
  'Ganon',
  'Agahnim 1',
  'Agahnim 2',
  'Floodgate',
  'Frog',
  'Missing Smith',
  'Dark Blacksmith Ruins',
  'Flute Activation Spot',
  'Capacity Upgrade Shop',
]);

const PRIZE_LOCATIONS: ReadonlySet<string> = new Set([
  'Eastern Palace - Prize',
  'Desert Palace - Prize',
  'Tower of Hera - Prize',
  'Palace of Darkness - Prize',
  'Swamp Palace - Prize',
  'Thieves\' Town - Prize',
  'Skull Woods - Prize',
  'Ice Palace - Prize',
  'Misery Mire - Prize',
  'Turtle Rock - Prize',
]);

export { KEY_DROP_LOCATIONS, CAPACITY_UPGRADE_LOCATIONS, EVENT_LOCATIONS, PRIZE_LOCATIONS };
