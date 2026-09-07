/* @layer bridge-wasm @kind data */
/**
 * Community-standard location names that differ from the derived
 * `<dungeon> - <check>` default. Keyed by the derived default name.
 */

const CHECK_NAME_OVERRIDES: Record<string, string> = {
  'Hyrule Castle - Dark Cross': 'Sewers - Dark Cross',
  'Hyrule Castle - Secret Room - Left': 'Sewers - Secret Room - Left',
  'Hyrule Castle - Secret Room - Middle': 'Sewers - Secret Room - Middle',
  'Hyrule Castle - Secret Room - Right': 'Sewers - Secret Room - Right',
  'Hyrule Castle - Sanctuary': 'Sanctuary',
  'Hyrule Castle - Key Rat Key Drop': 'Sewers - Key Rat Key Drop',
  // Boss-defeat events read as bare names, with no dungeon prefix.
  'Castle Tower - Agahnim 1': 'Agahnim 1',
  'Ganon\'s Tower - Agahnim 2': 'Agahnim 2',
  // Ganon's Tower's own checks drop the apostrophe.
  'Ganon\'s Tower - Bob\'s Torch': 'Ganons Tower - Bob\'s Torch',
  'Ganon\'s Tower - Hope Room - Left': 'Ganons Tower - Hope Room - Left',
  'Ganon\'s Tower - Hope Room - Right': 'Ganons Tower - Hope Room - Right',
  'Ganon\'s Tower - Tile Room': 'Ganons Tower - Tile Room',
  'Ganon\'s Tower - Compass Room - Top Left': 'Ganons Tower - Compass Room - Top Left',
  'Ganon\'s Tower - Compass Room - Top Right': 'Ganons Tower - Compass Room - Top Right',
  'Ganon\'s Tower - Compass Room - Bottom Left': 'Ganons Tower - Compass Room - Bottom Left',
  'Ganon\'s Tower - Compass Room - Bottom Right': 'Ganons Tower - Compass Room - Bottom Right',
  'Ganon\'s Tower - DMs Room - Top Left': 'Ganons Tower - DMs Room - Top Left',
  'Ganon\'s Tower - DMs Room - Top Right': 'Ganons Tower - DMs Room - Top Right',
  'Ganon\'s Tower - DMs Room - Bottom Left': 'Ganons Tower - DMs Room - Bottom Left',
  'Ganon\'s Tower - DMs Room - Bottom Right': 'Ganons Tower - DMs Room - Bottom Right',
  'Ganon\'s Tower - Map Chest': 'Ganons Tower - Map Chest',
  'Ganon\'s Tower - Firesnake Room': 'Ganons Tower - Firesnake Room',
  'Ganon\'s Tower - Randomizer Room - Top Left': 'Ganons Tower - Randomizer Room - Top Left',
  'Ganon\'s Tower - Randomizer Room - Top Right': 'Ganons Tower - Randomizer Room - Top Right',
  'Ganon\'s Tower - Randomizer Room - Bottom Left': 'Ganons Tower - Randomizer Room - Bottom Left',
  'Ganon\'s Tower - Randomizer Room - Bottom Right': 'Ganons Tower - Randomizer Room - Bottom Right',
  'Ganon\'s Tower - Bob\'s Chest': 'Ganons Tower - Bob\'s Chest',
  'Ganon\'s Tower - Big Chest': 'Ganons Tower - Big Chest',
  'Ganon\'s Tower - Big Key Room - Left': 'Ganons Tower - Big Key Room - Left',
  'Ganon\'s Tower - Big Key Room - Right': 'Ganons Tower - Big Key Room - Right',
  'Ganon\'s Tower - Big Key Chest': 'Ganons Tower - Big Key Chest',
  'Ganon\'s Tower - Mini Helmasaur Room - Left': 'Ganons Tower - Mini Helmasaur Room - Left',
  'Ganon\'s Tower - Mini Helmasaur Room - Right': 'Ganons Tower - Mini Helmasaur Room - Right',
  'Ganon\'s Tower - Pre-Moldorm Chest': 'Ganons Tower - Pre-Moldorm Chest',
  'Ganon\'s Tower - Validation Chest': 'Ganons Tower - Validation Chest',
  'Ganon\'s Tower - Conveyor Cross Pot Key': 'Ganons Tower - Conveyor Cross Pot Key',
  'Ganon\'s Tower - Double Switch Pot Key': 'Ganons Tower - Double Switch Pot Key',
  'Ganon\'s Tower - Conveyor Star Pits Pot Key': 'Ganons Tower - Conveyor Star Pits Pot Key',
  'Ganon\'s Tower - Mini Helmasaur Key Drop': 'Ganons Tower - Mini Helmasaur Key Drop',
};

export { CHECK_NAME_OVERRIDES };
