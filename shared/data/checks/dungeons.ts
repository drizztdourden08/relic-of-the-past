import type { CheckDefinition } from '../../types/tracker';

export const DUNGEON_CHECKS: CheckDefinition[] = [
  // ═══════════════════════════════════════════
  // Hyrule Castle / Sewers
  // ═══════════════════════════════════════════
  { id: 'Hyrule Castle - Boomerang Chest', name: 'Boomerang Chest', type: 'chest', region: 'Hyrule Castle', dungeon: 'Hyrule Castle', vanillaItem: 'Blue Boomerang' },
  { id: 'Hyrule Castle - Map Chest', name: 'Map Chest', type: 'chest', region: 'Hyrule Castle', dungeon: 'Hyrule Castle', vanillaItem: 'Map' },
  { id: "Hyrule Castle - Zelda's Chest", name: "Zelda's Chest", type: 'chest', region: 'Hyrule Castle', dungeon: 'Hyrule Castle', vanillaItem: '5 Rupees' },
  { id: 'Sewers - Dark Cross', name: 'Dark Cross', type: 'chest', region: 'Sewers (Dark)', dungeon: 'Hyrule Castle', vanillaItem: '5 Rupees' },
  { id: 'Sewers - Secret Room - Left', name: 'Secret Room - Left', type: 'chest', region: 'Sewers Secret Room', dungeon: 'Hyrule Castle', vanillaItem: '20 Rupees' },
  { id: 'Sewers - Secret Room - Middle', name: 'Secret Room - Middle', type: 'chest', region: 'Sewers Secret Room', dungeon: 'Hyrule Castle', vanillaItem: '20 Rupees' },
  { id: 'Sewers - Secret Room - Right', name: 'Secret Room - Right', type: 'chest', region: 'Sewers Secret Room', dungeon: 'Hyrule Castle', vanillaItem: '20 Rupees' },
  { id: 'Sanctuary', name: 'Sanctuary', type: 'chest', region: 'Sanctuary', dungeon: 'Hyrule Castle', vanillaItem: 'Heart Container' },
  // Key drops
  { id: 'Hyrule Castle - Map Guard Key Drop', name: 'Map Guard Key Drop', type: 'keyDrop', region: 'Hyrule Castle', dungeon: 'Hyrule Castle', vanillaItem: 'Small Key (Hyrule Castle)' },
  { id: 'Hyrule Castle - Boomerang Guard Key Drop', name: 'Boomerang Guard Key Drop', type: 'keyDrop', region: 'Hyrule Castle', dungeon: 'Hyrule Castle', vanillaItem: 'Small Key (Hyrule Castle)' },
  { id: 'Sewers - Key Rat Key Drop', name: 'Key Rat Key Drop', type: 'keyDrop', region: 'Sewers (Dark)', dungeon: 'Hyrule Castle', vanillaItem: 'Small Key (Hyrule Castle)' },
  { id: 'Hyrule Castle - Big Key Drop', name: 'Big Key Drop', type: 'keyDrop', region: 'Hyrule Castle', dungeon: 'Hyrule Castle', vanillaItem: 'Big Key (Hyrule Castle)' },

  // ═══════════════════════════════════════════
  // Castle Tower
  // ═══════════════════════════════════════════
  { id: 'Castle Tower - Room 03', name: 'Room 03', type: 'chest', region: 'Agahnims Tower', dungeon: 'Castle Tower', vanillaItem: '1 Rupee' },
  { id: 'Castle Tower - Dark Maze', name: 'Dark Maze', type: 'chest', region: 'Agahnims Tower', dungeon: 'Castle Tower', vanillaItem: '1 Rupee' },
  // Key drops
  { id: 'Castle Tower - Dark Archer Key Drop', name: 'Dark Archer Key Drop', type: 'keyDrop', region: 'Agahnims Tower', dungeon: 'Castle Tower', vanillaItem: 'Small Key (Agahnims Tower)' },
  { id: 'Castle Tower - Circle of Pots Key Drop', name: 'Circle of Pots Key Drop', type: 'keyDrop', region: 'Agahnims Tower', dungeon: 'Castle Tower', vanillaItem: 'Small Key (Agahnims Tower)' },

  // ═══════════════════════════════════════════
  // Eastern Palace
  // ═══════════════════════════════════════════
  { id: 'Eastern Palace - Compass Chest', name: 'Compass Chest', type: 'chest', region: 'Eastern Palace', dungeon: 'Eastern Palace', vanillaItem: 'Compass' },
  { id: 'Eastern Palace - Big Chest', name: 'Big Chest', type: 'chest', region: 'Eastern Palace', dungeon: 'Eastern Palace', vanillaItem: 'Bow' },
  { id: 'Eastern Palace - Cannonball Chest', name: 'Cannonball Chest', type: 'chest', region: 'Eastern Palace', dungeon: 'Eastern Palace', vanillaItem: '100 Rupees' },
  { id: 'Eastern Palace - Big Key Chest', name: 'Big Key Chest', type: 'chest', region: 'Eastern Palace', dungeon: 'Eastern Palace', vanillaItem: 'Big Key' },
  { id: 'Eastern Palace - Map Chest', name: 'Map Chest', type: 'chest', region: 'Eastern Palace', dungeon: 'Eastern Palace', vanillaItem: 'Map' },
  { id: 'Eastern Palace - Boss', name: 'Boss', type: 'boss', region: 'Eastern Palace', dungeon: 'Eastern Palace', vanillaItem: 'Heart Container' },
  { id: 'Eastern Palace - Prize', name: 'Prize', type: 'prize', region: 'Eastern Palace', dungeon: 'Eastern Palace', vanillaItem: 'Green Pendant' },
  // Key drops
  { id: 'Eastern Palace - Dark Square Pot Key', name: 'Dark Square Pot Key', type: 'keyDrop', region: 'Eastern Palace', dungeon: 'Eastern Palace', vanillaItem: 'Small Key (Eastern Palace)' },
  { id: 'Eastern Palace - Dark Eyegore Key Drop', name: 'Dark Eyegore Key Drop', type: 'keyDrop', region: 'Eastern Palace', dungeon: 'Eastern Palace', vanillaItem: 'Small Key (Eastern Palace)' },

  // ═══════════════════════════════════════════
  // Desert Palace
  // ═══════════════════════════════════════════
  { id: 'Desert Palace - Big Chest', name: 'Big Chest', type: 'chest', region: 'Desert Palace Main (Outer)', dungeon: 'Desert Palace', vanillaItem: 'Power Glove' },
  { id: 'Desert Palace - Torch', name: 'Torch', type: 'standing', region: 'Desert Palace Main (Outer)', dungeon: 'Desert Palace', vanillaItem: 'Small Key' },
  { id: 'Desert Palace - Map Chest', name: 'Map Chest', type: 'chest', region: 'Desert Palace Main (Outer)', dungeon: 'Desert Palace', vanillaItem: 'Map' },
  { id: 'Desert Palace - Compass Chest', name: 'Compass Chest', type: 'chest', region: 'Desert Palace East', dungeon: 'Desert Palace', vanillaItem: 'Compass' },
  { id: 'Desert Palace - Big Key Chest', name: 'Big Key Chest', type: 'chest', region: 'Desert Palace East', dungeon: 'Desert Palace', vanillaItem: 'Big Key' },
  { id: 'Desert Palace - Boss', name: 'Boss', type: 'boss', region: 'Desert Palace North', dungeon: 'Desert Palace', vanillaItem: 'Heart Container' },
  { id: 'Desert Palace - Prize', name: 'Prize', type: 'prize', region: 'Desert Palace North', dungeon: 'Desert Palace', vanillaItem: 'Blue Pendant' },
  // Key drops
  { id: 'Desert Palace - Desert Tiles 1 Pot Key', name: 'Desert Tiles 1 Pot Key', type: 'keyDrop', region: 'Desert Palace North', dungeon: 'Desert Palace', vanillaItem: 'Small Key (Desert Palace)' },
  { id: 'Desert Palace - Beamos Hall Pot Key', name: 'Beamos Hall Pot Key', type: 'keyDrop', region: 'Desert Palace North', dungeon: 'Desert Palace', vanillaItem: 'Small Key (Desert Palace)' },
  { id: 'Desert Palace - Desert Tiles 2 Pot Key', name: 'Desert Tiles 2 Pot Key', type: 'keyDrop', region: 'Desert Palace North', dungeon: 'Desert Palace', vanillaItem: 'Small Key (Desert Palace)' },

  // ═══════════════════════════════════════════
  // Tower of Hera
  // ═══════════════════════════════════════════
  { id: 'Tower of Hera - Basement Cage', name: 'Basement Cage', type: 'chest', region: 'Tower of Hera (Bottom)', dungeon: 'Tower of Hera', vanillaItem: 'Small Key' },
  { id: 'Tower of Hera - Map Chest', name: 'Map Chest', type: 'chest', region: 'Tower of Hera (Bottom)', dungeon: 'Tower of Hera', vanillaItem: 'Map' },
  { id: 'Tower of Hera - Big Key Chest', name: 'Big Key Chest', type: 'chest', region: 'Tower of Hera (Basement)', dungeon: 'Tower of Hera', vanillaItem: 'Big Key' },
  { id: 'Tower of Hera - Compass Chest', name: 'Compass Chest', type: 'chest', region: 'Tower of Hera (Top)', dungeon: 'Tower of Hera', vanillaItem: 'Compass' },
  { id: 'Tower of Hera - Big Chest', name: 'Big Chest', type: 'chest', region: 'Tower of Hera (Top)', dungeon: 'Tower of Hera', vanillaItem: 'Moon Pearl' },
  { id: 'Tower of Hera - Boss', name: 'Boss', type: 'boss', region: 'Tower of Hera (Top)', dungeon: 'Tower of Hera', vanillaItem: 'Heart Container' },
  { id: 'Tower of Hera - Prize', name: 'Prize', type: 'prize', region: 'Tower of Hera (Top)', dungeon: 'Tower of Hera', vanillaItem: 'Red Pendant' },

  // ═══════════════════════════════════════════
  // Palace of Darkness
  // ═══════════════════════════════════════════
  { id: 'Palace of Darkness - Shooter Room', name: 'Shooter Room', type: 'chest', region: 'Palace of Darkness (Entrance)', dungeon: 'Palace of Darkness', vanillaItem: 'Small Key' },
  { id: 'Palace of Darkness - The Arena - Bridge', name: 'The Arena - Bridge', type: 'chest', region: 'Palace of Darkness (Center)', dungeon: 'Palace of Darkness', vanillaItem: 'Small Key' },
  { id: 'Palace of Darkness - Stalfos Basement', name: 'Stalfos Basement', type: 'chest', region: 'Palace of Darkness (Center)', dungeon: 'Palace of Darkness', vanillaItem: 'Small Key' },
  { id: 'Palace of Darkness - Big Key Chest', name: 'Big Key Chest', type: 'chest', region: 'Palace of Darkness (Big Key Chest)', dungeon: 'Palace of Darkness', vanillaItem: 'Big Key' },
  { id: 'Palace of Darkness - The Arena - Ledge', name: 'The Arena - Ledge', type: 'chest', region: 'Palace of Darkness (Bonk Section)', dungeon: 'Palace of Darkness', vanillaItem: 'Small Key' },
  { id: 'Palace of Darkness - Map Chest', name: 'Map Chest', type: 'chest', region: 'Palace of Darkness (Bonk Section)', dungeon: 'Palace of Darkness', vanillaItem: 'Map' },
  { id: 'Palace of Darkness - Compass Chest', name: 'Compass Chest', type: 'chest', region: 'Palace of Darkness (North)', dungeon: 'Palace of Darkness', vanillaItem: 'Compass' },
  { id: 'Palace of Darkness - Dark Basement - Left', name: 'Dark Basement - Left', type: 'chest', region: 'Palace of Darkness (North)', dungeon: 'Palace of Darkness', vanillaItem: '10 Arrows' },
  { id: 'Palace of Darkness - Dark Basement - Right', name: 'Dark Basement - Right', type: 'chest', region: 'Palace of Darkness (North)', dungeon: 'Palace of Darkness', vanillaItem: 'Small Key' },
  { id: 'Palace of Darkness - Dark Maze - Top', name: 'Dark Maze - Top', type: 'chest', region: 'Palace of Darkness (Maze)', dungeon: 'Palace of Darkness', vanillaItem: '3 Bombs' },
  { id: 'Palace of Darkness - Dark Maze - Bottom', name: 'Dark Maze - Bottom', type: 'chest', region: 'Palace of Darkness (Maze)', dungeon: 'Palace of Darkness', vanillaItem: 'Small Key' },
  { id: 'Palace of Darkness - Big Chest', name: 'Big Chest', type: 'chest', region: 'Palace of Darkness (Maze)', dungeon: 'Palace of Darkness', vanillaItem: 'Hammer' },
  { id: 'Palace of Darkness - Harmless Hellway', name: 'Harmless Hellway', type: 'chest', region: 'Palace of Darkness (Harmless Hellway)', dungeon: 'Palace of Darkness', vanillaItem: '5 Rupees' },
  { id: 'Palace of Darkness - Boss', name: 'Boss', type: 'boss', region: 'Palace of Darkness (Final Section)', dungeon: 'Palace of Darkness', vanillaItem: 'Heart Container' },
  { id: 'Palace of Darkness - Prize', name: 'Prize', type: 'prize', region: 'Palace of Darkness (Final Section)', dungeon: 'Palace of Darkness', vanillaItem: 'Crystal 1' },

  // ═══════════════════════════════════════════
  // Swamp Palace
  // ═══════════════════════════════════════════
  { id: 'Swamp Palace - Entrance', name: 'Entrance', type: 'chest', region: 'Swamp Palace (First Room)', dungeon: 'Swamp Palace', vanillaItem: 'Small Key' },
  { id: 'Swamp Palace - Map Chest', name: 'Map Chest', type: 'chest', region: 'Swamp Palace (Starting Area)', dungeon: 'Swamp Palace', vanillaItem: 'Map' },
  { id: 'Swamp Palace - Big Chest', name: 'Big Chest', type: 'chest', region: 'Swamp Palace (Center)', dungeon: 'Swamp Palace', vanillaItem: 'Hookshot' },
  { id: 'Swamp Palace - Compass Chest', name: 'Compass Chest', type: 'chest', region: 'Swamp Palace (Center)', dungeon: 'Swamp Palace', vanillaItem: 'Compass' },
  { id: 'Swamp Palace - Big Key Chest', name: 'Big Key Chest', type: 'chest', region: 'Swamp Palace (West)', dungeon: 'Swamp Palace', vanillaItem: 'Big Key' },
  { id: 'Swamp Palace - West Chest', name: 'West Chest', type: 'chest', region: 'Swamp Palace (West)', dungeon: 'Swamp Palace', vanillaItem: '20 Rupees' },
  { id: 'Swamp Palace - Flooded Room - Left', name: 'Flooded Room - Left', type: 'chest', region: 'Swamp Palace (North)', dungeon: 'Swamp Palace', vanillaItem: '20 Rupees' },
  { id: 'Swamp Palace - Flooded Room - Right', name: 'Flooded Room - Right', type: 'chest', region: 'Swamp Palace (North)', dungeon: 'Swamp Palace', vanillaItem: '20 Rupees' },
  { id: 'Swamp Palace - Waterfall Room', name: 'Waterfall Room', type: 'chest', region: 'Swamp Palace (North)', dungeon: 'Swamp Palace', vanillaItem: '20 Rupees' },
  { id: 'Swamp Palace - Boss', name: 'Boss', type: 'boss', region: 'Swamp Palace (North)', dungeon: 'Swamp Palace', vanillaItem: 'Heart Container' },
  { id: 'Swamp Palace - Prize', name: 'Prize', type: 'prize', region: 'Swamp Palace (North)', dungeon: 'Swamp Palace', vanillaItem: 'Crystal 2' },
  // Key drops
  { id: 'Swamp Palace - Pot Row Pot Key', name: 'Pot Row Pot Key', type: 'keyDrop', region: 'Swamp Palace (Starting Area)', dungeon: 'Swamp Palace', vanillaItem: 'Small Key (Swamp Palace)' },
  { id: 'Swamp Palace - Trench 1 Pot Key', name: 'Trench 1 Pot Key', type: 'keyDrop', region: 'Swamp Palace (Starting Area)', dungeon: 'Swamp Palace', vanillaItem: 'Small Key (Swamp Palace)' },
  { id: 'Swamp Palace - Hookshot Pot Key', name: 'Hookshot Pot Key', type: 'keyDrop', region: 'Swamp Palace (Center)', dungeon: 'Swamp Palace', vanillaItem: 'Small Key (Swamp Palace)' },
  { id: 'Swamp Palace - Trench 2 Pot Key', name: 'Trench 2 Pot Key', type: 'keyDrop', region: 'Swamp Palace (Center)', dungeon: 'Swamp Palace', vanillaItem: 'Small Key (Swamp Palace)' },
  { id: 'Swamp Palace - Waterway Pot Key', name: 'Waterway Pot Key', type: 'keyDrop', region: 'Swamp Palace (North)', dungeon: 'Swamp Palace', vanillaItem: 'Small Key (Swamp Palace)' },

  // ═══════════════════════════════════════════
  // Thieves' Town
  // ═══════════════════════════════════════════
  { id: "Thieves' Town - Big Key Chest", name: 'Big Key Chest', type: 'chest', region: 'Thieves Town (Entrance)', dungeon: "Thieves' Town", vanillaItem: 'Big Key' },
  { id: "Thieves' Town - Map Chest", name: 'Map Chest', type: 'chest', region: 'Thieves Town (Entrance)', dungeon: "Thieves' Town", vanillaItem: 'Map' },
  { id: "Thieves' Town - Compass Chest", name: 'Compass Chest', type: 'chest', region: 'Thieves Town (Entrance)', dungeon: "Thieves' Town", vanillaItem: 'Compass' },
  { id: "Thieves' Town - Ambush Chest", name: 'Ambush Chest', type: 'chest', region: 'Thieves Town (Entrance)', dungeon: "Thieves' Town", vanillaItem: '20 Rupees' },
  { id: "Thieves' Town - Attic", name: 'Attic', type: 'chest', region: 'Thieves Town (Deep)', dungeon: "Thieves' Town", vanillaItem: 'Small Key' },
  { id: "Thieves' Town - Big Chest", name: 'Big Chest', type: 'chest', region: 'Thieves Town (Deep)', dungeon: "Thieves' Town", vanillaItem: 'Titans Mitts' },
  { id: "Thieves' Town - Blind's Cell", name: "Blind's Cell", type: 'chest', region: 'Thieves Town (Deep)', dungeon: "Thieves' Town", vanillaItem: '20 Rupees' },
  { id: "Thieves' Town - Boss", name: 'Boss', type: 'boss', region: 'Blind Fight', dungeon: "Thieves' Town", vanillaItem: 'Heart Container' },
  { id: "Thieves' Town - Prize", name: 'Prize', type: 'prize', region: 'Blind Fight', dungeon: "Thieves' Town", vanillaItem: 'Crystal 4' },
  // Key drops
  { id: "Thieves' Town - Hallway Pot Key", name: 'Hallway Pot Key', type: 'keyDrop', region: 'Thieves Town (Deep)', dungeon: "Thieves' Town", vanillaItem: 'Small Key (Thieves Town)' },
  { id: "Thieves' Town - Spike Switch Pot Key", name: 'Spike Switch Pot Key', type: 'keyDrop', region: 'Thieves Town (Deep)', dungeon: "Thieves' Town", vanillaItem: 'Small Key (Thieves Town)' },

  // ═══════════════════════════════════════════
  // Skull Woods
  // ═══════════════════════════════════════════
  { id: 'Skull Woods - Compass Chest', name: 'Compass Chest', type: 'chest', region: 'Skull Woods First Section (Left)', dungeon: 'Skull Woods', vanillaItem: 'Compass' },
  { id: 'Skull Woods - Map Chest', name: 'Map Chest', type: 'chest', region: 'Skull Woods First Section', dungeon: 'Skull Woods', vanillaItem: 'Map' },
  { id: 'Skull Woods - Big Chest', name: 'Big Chest', type: 'chest', region: 'Skull Woods First Section (Top)', dungeon: 'Skull Woods', vanillaItem: 'Fire Rod' },
  { id: 'Skull Woods - Pot Prison', name: 'Pot Prison', type: 'chest', region: 'Skull Woods First Section (Left)', dungeon: 'Skull Woods', vanillaItem: '5 Rupees' },
  { id: 'Skull Woods - Pinball Room', name: 'Pinball Room', type: 'chest', region: 'Skull Woods First Section (Right)', dungeon: 'Skull Woods', vanillaItem: 'Small Key' },
  { id: 'Skull Woods - Big Key Chest', name: 'Big Key Chest', type: 'chest', region: 'Skull Woods Second Section', dungeon: 'Skull Woods', vanillaItem: 'Big Key' },
  { id: 'Skull Woods - Bridge Room', name: 'Bridge Room', type: 'chest', region: 'Skull Woods Final Section (Entrance)', dungeon: 'Skull Woods', vanillaItem: 'Small Key' },
  { id: 'Skull Woods - Boss', name: 'Boss', type: 'boss', region: 'Skull Woods Final Section (Mothula)', dungeon: 'Skull Woods', vanillaItem: 'Heart Container' },
  { id: 'Skull Woods - Prize', name: 'Prize', type: 'prize', region: 'Skull Woods Final Section (Mothula)', dungeon: 'Skull Woods', vanillaItem: 'Crystal 3' },
  // Key drops
  { id: 'Skull Woods - West Lobby Pot Key', name: 'West Lobby Pot Key', type: 'keyDrop', region: 'Skull Woods Second Section', dungeon: 'Skull Woods', vanillaItem: 'Small Key (Skull Woods)' },
  { id: 'Skull Woods - Spike Corner Key Drop', name: 'Spike Corner Key Drop', type: 'keyDrop', region: 'Skull Woods Final Section (Mothula)', dungeon: 'Skull Woods', vanillaItem: 'Small Key (Skull Woods)' },

  // ═══════════════════════════════════════════
  // Ice Palace
  // ═══════════════════════════════════════════
  { id: 'Ice Palace - Compass Chest', name: 'Compass Chest', type: 'chest', region: 'Ice Palace (Entrance)', dungeon: 'Ice Palace', vanillaItem: 'Compass' },
  { id: 'Ice Palace - Freezor Chest', name: 'Freezor Chest', type: 'chest', region: 'Ice Palace (Main)', dungeon: 'Ice Palace', vanillaItem: '50 Rupees' },
  { id: 'Ice Palace - Big Chest', name: 'Big Chest', type: 'chest', region: 'Ice Palace (Main)', dungeon: 'Ice Palace', vanillaItem: 'Blue Mail' },
  { id: 'Ice Palace - Iced T Room', name: 'Iced T Room', type: 'chest', region: 'Ice Palace (Main)', dungeon: 'Ice Palace', vanillaItem: '5 Rupees' },
  { id: 'Ice Palace - Spike Room', name: 'Spike Room', type: 'chest', region: 'Ice Palace (East)', dungeon: 'Ice Palace', vanillaItem: '20 Rupees' },
  { id: 'Ice Palace - Big Key Chest', name: 'Big Key Chest', type: 'chest', region: 'Ice Palace (East Top)', dungeon: 'Ice Palace', vanillaItem: 'Big Key' },
  { id: 'Ice Palace - Map Chest', name: 'Map Chest', type: 'chest', region: 'Ice Palace (East Top)', dungeon: 'Ice Palace', vanillaItem: 'Map' },
  { id: 'Ice Palace - Boss', name: 'Boss', type: 'boss', region: 'Ice Palace (Kholdstare)', dungeon: 'Ice Palace', vanillaItem: 'Heart Container' },
  { id: 'Ice Palace - Prize', name: 'Prize', type: 'prize', region: 'Ice Palace (Kholdstare)', dungeon: 'Ice Palace', vanillaItem: 'Crystal 5' },
  // Key drops
  { id: 'Ice Palace - Jelly Key Drop', name: 'Jelly Key Drop', type: 'keyDrop', region: 'Ice Palace (Entrance)', dungeon: 'Ice Palace', vanillaItem: 'Small Key (Ice Palace)' },
  { id: 'Ice Palace - Conveyor Key Drop', name: 'Conveyor Key Drop', type: 'keyDrop', region: 'Ice Palace (Second Section)', dungeon: 'Ice Palace', vanillaItem: 'Small Key (Ice Palace)' },
  { id: 'Ice Palace - Hammer Block Key Drop', name: 'Hammer Block Key Drop', type: 'keyDrop', region: 'Ice Palace (East Top)', dungeon: 'Ice Palace', vanillaItem: 'Small Key (Ice Palace)' },
  { id: 'Ice Palace - Many Pots Pot Key', name: 'Many Pots Pot Key', type: 'keyDrop', region: 'Ice Palace (Main)', dungeon: 'Ice Palace', vanillaItem: 'Small Key (Ice Palace)' },

  // ═══════════════════════════════════════════
  // Misery Mire
  // ═══════════════════════════════════════════
  { id: 'Misery Mire - Big Chest', name: 'Big Chest', type: 'chest', region: 'Misery Mire (Main)', dungeon: 'Misery Mire', vanillaItem: 'Cane of Somaria' },
  { id: 'Misery Mire - Map Chest', name: 'Map Chest', type: 'chest', region: 'Misery Mire (Main)', dungeon: 'Misery Mire', vanillaItem: 'Map' },
  { id: 'Misery Mire - Main Lobby', name: 'Main Lobby', type: 'chest', region: 'Misery Mire (Main)', dungeon: 'Misery Mire', vanillaItem: 'Small Key' },
  { id: 'Misery Mire - Bridge Chest', name: 'Bridge Chest', type: 'chest', region: 'Misery Mire (Main)', dungeon: 'Misery Mire', vanillaItem: 'Small Key' },
  { id: 'Misery Mire - Spike Chest', name: 'Spike Chest', type: 'chest', region: 'Misery Mire (Main)', dungeon: 'Misery Mire', vanillaItem: '50 Rupees' },
  { id: 'Misery Mire - Compass Chest', name: 'Compass Chest', type: 'chest', region: 'Misery Mire (West)', dungeon: 'Misery Mire', vanillaItem: 'Compass' },
  { id: 'Misery Mire - Big Key Chest', name: 'Big Key Chest', type: 'chest', region: 'Misery Mire (West)', dungeon: 'Misery Mire', vanillaItem: 'Big Key' },
  { id: 'Misery Mire - Boss', name: 'Boss', type: 'boss', region: 'Misery Mire (Vitreous)', dungeon: 'Misery Mire', vanillaItem: 'Heart Container' },
  { id: 'Misery Mire - Prize', name: 'Prize', type: 'prize', region: 'Misery Mire (Vitreous)', dungeon: 'Misery Mire', vanillaItem: 'Crystal 6' },
  // Key drops
  { id: 'Misery Mire - Spikes Pot Key', name: 'Spikes Pot Key', type: 'keyDrop', region: 'Misery Mire (Main)', dungeon: 'Misery Mire', vanillaItem: 'Small Key (Misery Mire)' },
  { id: 'Misery Mire - Fishbone Pot Key', name: 'Fishbone Pot Key', type: 'keyDrop', region: 'Misery Mire (Main)', dungeon: 'Misery Mire', vanillaItem: 'Small Key (Misery Mire)' },
  { id: 'Misery Mire - Conveyor Crystal Key Drop', name: 'Conveyor Crystal Key Drop', type: 'keyDrop', region: 'Misery Mire (Main)', dungeon: 'Misery Mire', vanillaItem: 'Small Key (Misery Mire)' },

  // ═══════════════════════════════════════════
  // Turtle Rock
  // ═══════════════════════════════════════════
  { id: 'Turtle Rock - Compass Chest', name: 'Compass Chest', type: 'chest', region: 'Turtle Rock (First Section)', dungeon: 'Turtle Rock', vanillaItem: 'Compass' },
  { id: 'Turtle Rock - Roller Room - Left', name: 'Roller Room - Left', type: 'chest', region: 'Turtle Rock (First Section)', dungeon: 'Turtle Rock', vanillaItem: 'Small Key' },
  { id: 'Turtle Rock - Roller Room - Right', name: 'Roller Room - Right', type: 'chest', region: 'Turtle Rock (First Section)', dungeon: 'Turtle Rock', vanillaItem: 'Small Key' },
  { id: 'Turtle Rock - Chain Chomps', name: 'Chain Chomps', type: 'chest', region: 'Turtle Rock (Chain Chomp Room)', dungeon: 'Turtle Rock', vanillaItem: '10 Arrows' },
  { id: 'Turtle Rock - Big Key Chest', name: 'Big Key Chest', type: 'chest', region: 'Turtle Rock (Second Section)', dungeon: 'Turtle Rock', vanillaItem: 'Big Key' },
  { id: 'Turtle Rock - Big Chest', name: 'Big Chest', type: 'chest', region: 'Turtle Rock (Big Chest)', dungeon: 'Turtle Rock', vanillaItem: 'Mirror Shield' },
  { id: 'Turtle Rock - Crystaroller Room', name: 'Crystaroller Room', type: 'chest', region: 'Turtle Rock (Crystaroller Room)', dungeon: 'Turtle Rock', vanillaItem: 'Small Key' },
  { id: 'Turtle Rock - Eye Bridge - Bottom Left', name: 'Eye Bridge - Bottom Left', type: 'chest', region: 'Turtle Rock (Eye Bridge)', dungeon: 'Turtle Rock', vanillaItem: 'Small Key' },
  { id: 'Turtle Rock - Eye Bridge - Bottom Right', name: 'Eye Bridge - Bottom Right', type: 'chest', region: 'Turtle Rock (Eye Bridge)', dungeon: 'Turtle Rock', vanillaItem: '5 Rupees' },
  { id: 'Turtle Rock - Eye Bridge - Top Left', name: 'Eye Bridge - Top Left', type: 'chest', region: 'Turtle Rock (Eye Bridge)', dungeon: 'Turtle Rock', vanillaItem: '20 Rupees' },
  { id: 'Turtle Rock - Eye Bridge - Top Right', name: 'Eye Bridge - Top Right', type: 'chest', region: 'Turtle Rock (Eye Bridge)', dungeon: 'Turtle Rock', vanillaItem: 'Map' },
  { id: 'Turtle Rock - Boss', name: 'Boss', type: 'boss', region: 'Turtle Rock (Trinexx)', dungeon: 'Turtle Rock', vanillaItem: 'Heart Container' },
  { id: 'Turtle Rock - Prize', name: 'Prize', type: 'prize', region: 'Turtle Rock (Trinexx)', dungeon: 'Turtle Rock', vanillaItem: 'Crystal 7' },
  // Key drops
  { id: 'Turtle Rock - Pokey 1 Key Drop', name: 'Pokey 1 Key Drop', type: 'keyDrop', region: 'Turtle Rock (Pokey Room)', dungeon: 'Turtle Rock', vanillaItem: 'Small Key (Turtle Rock)' },
  { id: 'Turtle Rock - Pokey 2 Key Drop', name: 'Pokey 2 Key Drop', type: 'keyDrop', region: 'Turtle Rock (Second Section)', dungeon: 'Turtle Rock', vanillaItem: 'Small Key (Turtle Rock)' },

  // ═══════════════════════════════════════════
  // Ganon's Tower
  // ═══════════════════════════════════════════
  { id: "Ganons Tower - Bob's Torch", name: "Bob's Torch", type: 'standing', region: 'Ganons Tower (Entrance)', dungeon: "Ganon's Tower", vanillaItem: 'Small Key' },
  { id: 'Ganons Tower - Hope Room - Left', name: 'Hope Room - Left', type: 'chest', region: 'Ganons Tower (Entrance)', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: 'Ganons Tower - Hope Room - Right', name: 'Hope Room - Right', type: 'chest', region: 'Ganons Tower (Entrance)', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: 'Ganons Tower - Tile Room', name: 'Tile Room', type: 'chest', region: 'Ganons Tower (Tile Room)', dungeon: "Ganon's Tower", vanillaItem: 'Small Key' },
  { id: 'Ganons Tower - Compass Room - Top Left', name: 'Compass Room - Top Left', type: 'chest', region: 'Ganons Tower (Compass Room)', dungeon: "Ganon's Tower", vanillaItem: 'Compass' },
  { id: 'Ganons Tower - Compass Room - Top Right', name: 'Compass Room - Top Right', type: 'chest', region: 'Ganons Tower (Compass Room)', dungeon: "Ganon's Tower", vanillaItem: '10 Bombs' },
  { id: 'Ganons Tower - Compass Room - Bottom Left', name: 'Compass Room - Bottom Left', type: 'chest', region: 'Ganons Tower (Compass Room)', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: 'Ganons Tower - Compass Room - Bottom Right', name: 'Compass Room - Bottom Right', type: 'chest', region: 'Ganons Tower (Compass Room)', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: 'Ganons Tower - DMs Room - Top Left', name: 'DMs Room - Top Left', type: 'chest', region: 'Ganons Tower (Hookshot Room)', dungeon: "Ganon's Tower", vanillaItem: '10 Bombs' },
  { id: 'Ganons Tower - DMs Room - Top Right', name: 'DMs Room - Top Right', type: 'chest', region: 'Ganons Tower (Hookshot Room)', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: 'Ganons Tower - DMs Room - Bottom Left', name: 'DMs Room - Bottom Left', type: 'chest', region: 'Ganons Tower (Hookshot Room)', dungeon: "Ganon's Tower", vanillaItem: '10 Bombs' },
  { id: 'Ganons Tower - DMs Room - Bottom Right', name: 'DMs Room - Bottom Right', type: 'chest', region: 'Ganons Tower (Hookshot Room)', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: 'Ganons Tower - Map Chest', name: 'Map Chest', type: 'chest', region: 'Ganons Tower (Map Room)', dungeon: "Ganon's Tower", vanillaItem: 'Map' },
  { id: 'Ganons Tower - Firesnake Room', name: 'Firesnake Room', type: 'chest', region: 'Ganons Tower (Firesnake Room)', dungeon: "Ganon's Tower", vanillaItem: 'Small Key' },
  { id: 'Ganons Tower - Randomizer Room - Top Left', name: 'Randomizer Room - Top Left', type: 'chest', region: 'Ganons Tower (Teleport Room)', dungeon: "Ganon's Tower", vanillaItem: '10 Bombs' },
  { id: 'Ganons Tower - Randomizer Room - Top Right', name: 'Randomizer Room - Top Right', type: 'chest', region: 'Ganons Tower (Teleport Room)', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: 'Ganons Tower - Randomizer Room - Bottom Left', name: 'Randomizer Room - Bottom Left', type: 'chest', region: 'Ganons Tower (Teleport Room)', dungeon: "Ganon's Tower", vanillaItem: '10 Bombs' },
  { id: 'Ganons Tower - Randomizer Room - Bottom Right', name: 'Randomizer Room - Bottom Right', type: 'chest', region: 'Ganons Tower (Teleport Room)', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: "Ganons Tower - Bob's Chest", name: "Bob's Chest", type: 'chest', region: 'Ganons Tower (Bottom)', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: 'Ganons Tower - Big Chest', name: 'Big Chest', type: 'chest', region: 'Ganons Tower (Bottom)', dungeon: "Ganon's Tower", vanillaItem: 'Red Mail' },
  { id: 'Ganons Tower - Big Key Room - Left', name: 'Big Key Room - Left', type: 'chest', region: 'Ganons Tower (Bottom)', dungeon: "Ganon's Tower", vanillaItem: '10 Bombs' },
  { id: 'Ganons Tower - Big Key Room - Right', name: 'Big Key Room - Right', type: 'chest', region: 'Ganons Tower (Bottom)', dungeon: "Ganon's Tower", vanillaItem: '10 Bombs' },
  { id: 'Ganons Tower - Big Key Chest', name: 'Big Key Chest', type: 'chest', region: 'Ganons Tower (Bottom)', dungeon: "Ganon's Tower", vanillaItem: 'Big Key' },
  { id: 'Ganons Tower - Mini Helmasaur Room - Left', name: 'Mini Helmasaur Room - Left', type: 'chest', region: 'Ganons Tower (Before Moldorm)', dungeon: "Ganon's Tower", vanillaItem: '3 Bombs' },
  { id: 'Ganons Tower - Mini Helmasaur Room - Right', name: 'Mini Helmasaur Room - Right', type: 'chest', region: 'Ganons Tower (Before Moldorm)', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: 'Ganons Tower - Pre-Moldorm Chest', name: 'Pre-Moldorm Chest', type: 'chest', region: 'Ganons Tower (Before Moldorm)', dungeon: "Ganon's Tower", vanillaItem: 'Small Key' },
  { id: 'Ganons Tower - Validation Chest', name: 'Validation Chest', type: 'chest', region: 'Agahnim 2', dungeon: "Ganon's Tower", vanillaItem: '300 Rupees' },
  // Key drops
  { id: 'Ganons Tower - Conveyor Cross Pot Key', name: 'Conveyor Cross Pot Key', type: 'keyDrop', region: 'Ganons Tower (Entrance)', dungeon: "Ganon's Tower", vanillaItem: 'Small Key (Ganons Tower)' },
  { id: 'Ganons Tower - Double Switch Pot Key', name: 'Double Switch Pot Key', type: 'keyDrop', region: 'Ganons Tower (Hookshot Room)', dungeon: "Ganon's Tower", vanillaItem: 'Small Key (Ganons Tower)' },
  { id: 'Ganons Tower - Conveyor Star Pits Pot Key', name: 'Conveyor Star Pits Pot Key', type: 'keyDrop', region: 'Ganons Tower (Compass Room)', dungeon: "Ganon's Tower", vanillaItem: 'Small Key (Ganons Tower)' },
  { id: 'Ganons Tower - Mini Helmasaur Key Drop', name: 'Mini Helmasaur Key Drop', type: 'keyDrop', region: 'Ganons Tower (Before Moldorm)', dungeon: "Ganon's Tower", vanillaItem: 'Small Key (Ganons Tower)' },
];
