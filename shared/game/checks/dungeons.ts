/* @layer shared-game @kind data */
﻿import type { CheckDefinition } from '../types';

const DUNGEON_CHECKS: CheckDefinition[] = [
  // ═══════════════════════════════════════════
  // Hyrule Castle / Sewers
  // ═══════════════════════════════════════════
  { id: 'Hyrule Castle - Boomerang Chest', name: 'Boomerang Chest', type: 'chest', screen: 'hyrule-castle', dungeon: 'Hyrule Castle', vanillaItem: 'Blue Boomerang' },
  { id: 'Hyrule Castle - Map Chest', name: 'Map Chest', type: 'chest', screen: 'hyrule-castle', dungeon: 'Hyrule Castle', vanillaItem: 'Map' },
  { id: "Hyrule Castle - Zelda's Chest", name: "Zelda's Chest", type: 'chest', screen: 'hyrule-castle', dungeon: 'Hyrule Castle', vanillaItem: '5 Rupees' },
  { id: 'Sewers - Dark Cross', name: 'Dark Cross', type: 'chest', screen: 'sewers-dark', dungeon: 'Hyrule Castle', vanillaItem: '5 Rupees' },
  { id: 'Sewers - Secret Room - Left', name: 'Secret Room - Left', type: 'chest', screen: 'sewers-secret-room', dungeon: 'Hyrule Castle', vanillaItem: '20 Rupees' },
  { id: 'Sewers - Secret Room - Middle', name: 'Secret Room - Middle', type: 'chest', screen: 'sewers-secret-room', dungeon: 'Hyrule Castle', vanillaItem: '20 Rupees' },
  { id: 'Sewers - Secret Room - Right', name: 'Secret Room - Right', type: 'chest', screen: 'sewers-secret-room', dungeon: 'Hyrule Castle', vanillaItem: '20 Rupees' },
  { id: 'Sanctuary', name: 'Sanctuary', type: 'chest', screen: 'sanctuary', dungeon: 'Hyrule Castle', vanillaItem: 'Heart Container' },
  // Key drops
  { id: 'Hyrule Castle - Map Guard Key Drop', name: 'Map Guard Key Drop', type: 'keyDrop', screen: 'hyrule-castle', dungeon: 'Hyrule Castle', vanillaItem: 'Small Key (Hyrule Castle)' },
  { id: 'Hyrule Castle - Boomerang Guard Key Drop', name: 'Boomerang Guard Key Drop', type: 'keyDrop', screen: 'hyrule-castle', dungeon: 'Hyrule Castle', vanillaItem: 'Small Key (Hyrule Castle)' },
  { id: 'Sewers - Key Rat Key Drop', name: 'Key Rat Key Drop', type: 'keyDrop', screen: 'sewers-dark', dungeon: 'Hyrule Castle', vanillaItem: 'Small Key (Hyrule Castle)' },
  { id: 'Hyrule Castle - Big Key Drop', name: 'Big Key Drop', type: 'keyDrop', screen: 'hyrule-castle', dungeon: 'Hyrule Castle', vanillaItem: 'Big Key (Hyrule Castle)' },

  // ═══════════════════════════════════════════
  // Castle Tower
  // ═══════════════════════════════════════════
  { id: 'Castle Tower - Room 03', name: 'Room 03', type: 'chest', screen: 'agahnims-tower', dungeon: 'Castle Tower', vanillaItem: '1 Rupee' },
  { id: 'Castle Tower - Dark Maze', name: 'Dark Maze', type: 'chest', screen: 'agahnims-tower', dungeon: 'Castle Tower', vanillaItem: '1 Rupee' },
  // Key drops
  { id: 'Castle Tower - Dark Archer Key Drop', name: 'Dark Archer Key Drop', type: 'keyDrop', screen: 'agahnims-tower', dungeon: 'Castle Tower', vanillaItem: 'Small Key (Agahnims Tower)' },
  { id: 'Castle Tower - Circle of Pots Key Drop', name: 'Circle of Pots Key Drop', type: 'keyDrop', screen: 'agahnims-tower', dungeon: 'Castle Tower', vanillaItem: 'Small Key (Agahnims Tower)' },

  // ═══════════════════════════════════════════
  // Eastern Palace
  // ═══════════════════════════════════════════
  { id: 'Eastern Palace - Compass Chest', name: 'Compass Chest', type: 'chest', screen: 'eastern-palace', dungeon: 'Eastern Palace', vanillaItem: 'Compass' },
  { id: 'Eastern Palace - Big Chest', name: 'Big Chest', type: 'chest', screen: 'eastern-palace', dungeon: 'Eastern Palace', vanillaItem: 'Bow' },
  { id: 'Eastern Palace - Cannonball Chest', name: 'Cannonball Chest', type: 'chest', screen: 'eastern-palace', dungeon: 'Eastern Palace', vanillaItem: '100 Rupees' },
  { id: 'Eastern Palace - Big Key Chest', name: 'Big Key Chest', type: 'chest', screen: 'eastern-palace', dungeon: 'Eastern Palace', vanillaItem: 'Big Key' },
  { id: 'Eastern Palace - Map Chest', name: 'Map Chest', type: 'chest', screen: 'eastern-palace', dungeon: 'Eastern Palace', vanillaItem: 'Map' },
  { id: 'Eastern Palace - Boss', name: 'Boss', type: 'boss', screen: 'eastern-palace', dungeon: 'Eastern Palace', vanillaItem: 'Heart Container' },
  { id: 'Eastern Palace - Prize', name: 'Prize', type: 'prize', screen: 'eastern-palace', dungeon: 'Eastern Palace', vanillaItem: 'Green Pendant' },
  // Key drops
  { id: 'Eastern Palace - Dark Square Pot Key', name: 'Dark Square Pot Key', type: 'keyDrop', screen: 'eastern-palace', dungeon: 'Eastern Palace', vanillaItem: 'Small Key (Eastern Palace)' },
  { id: 'Eastern Palace - Dark Eyegore Key Drop', name: 'Dark Eyegore Key Drop', type: 'keyDrop', screen: 'eastern-palace', dungeon: 'Eastern Palace', vanillaItem: 'Small Key (Eastern Palace)' },

  // ═══════════════════════════════════════════
  // Desert Palace
  // ═══════════════════════════════════════════
  { id: 'Desert Palace - Big Chest', name: 'Big Chest', type: 'chest', screen: 'desert-palace-main-outer', dungeon: 'Desert Palace', vanillaItem: 'Power Glove' },
  { id: 'Desert Palace - Torch', name: 'Torch', type: 'standing', screen: 'desert-palace-main-outer', dungeon: 'Desert Palace', vanillaItem: 'Small Key' },
  { id: 'Desert Palace - Map Chest', name: 'Map Chest', type: 'chest', screen: 'desert-palace-main-outer', dungeon: 'Desert Palace', vanillaItem: 'Map' },
  { id: 'Desert Palace - Compass Chest', name: 'Compass Chest', type: 'chest', screen: 'desert-palace-east', dungeon: 'Desert Palace', vanillaItem: 'Compass' },
  { id: 'Desert Palace - Big Key Chest', name: 'Big Key Chest', type: 'chest', screen: 'desert-palace-east', dungeon: 'Desert Palace', vanillaItem: 'Big Key' },
  { id: 'Desert Palace - Boss', name: 'Boss', type: 'boss', screen: 'desert-palace-north', dungeon: 'Desert Palace', vanillaItem: 'Heart Container' },
  { id: 'Desert Palace - Prize', name: 'Prize', type: 'prize', screen: 'desert-palace-north', dungeon: 'Desert Palace', vanillaItem: 'Blue Pendant' },
  // Key drops
  { id: 'Desert Palace - Desert Tiles 1 Pot Key', name: 'Desert Tiles 1 Pot Key', type: 'keyDrop', screen: 'desert-palace-north', dungeon: 'Desert Palace', vanillaItem: 'Small Key (Desert Palace)' },
  { id: 'Desert Palace - Beamos Hall Pot Key', name: 'Beamos Hall Pot Key', type: 'keyDrop', screen: 'desert-palace-north', dungeon: 'Desert Palace', vanillaItem: 'Small Key (Desert Palace)' },
  { id: 'Desert Palace - Desert Tiles 2 Pot Key', name: 'Desert Tiles 2 Pot Key', type: 'keyDrop', screen: 'desert-palace-north', dungeon: 'Desert Palace', vanillaItem: 'Small Key (Desert Palace)' },

  // ═══════════════════════════════════════════
  // Tower of Hera
  // ═══════════════════════════════════════════
  { id: 'Tower of Hera - Basement Cage', name: 'Basement Cage', type: 'chest', screen: 'tower-of-hera-bottom', dungeon: 'Tower of Hera', vanillaItem: 'Small Key' },
  { id: 'Tower of Hera - Map Chest', name: 'Map Chest', type: 'chest', screen: 'tower-of-hera-bottom', dungeon: 'Tower of Hera', vanillaItem: 'Map' },
  { id: 'Tower of Hera - Big Key Chest', name: 'Big Key Chest', type: 'chest', screen: 'tower-of-hera-basement', dungeon: 'Tower of Hera', vanillaItem: 'Big Key' },
  { id: 'Tower of Hera - Compass Chest', name: 'Compass Chest', type: 'chest', screen: 'tower-of-hera-top', dungeon: 'Tower of Hera', vanillaItem: 'Compass' },
  { id: 'Tower of Hera - Big Chest', name: 'Big Chest', type: 'chest', screen: 'tower-of-hera-top', dungeon: 'Tower of Hera', vanillaItem: 'Moon Pearl' },
  { id: 'Tower of Hera - Boss', name: 'Boss', type: 'boss', screen: 'tower-of-hera-top', dungeon: 'Tower of Hera', vanillaItem: 'Heart Container' },
  { id: 'Tower of Hera - Prize', name: 'Prize', type: 'prize', screen: 'tower-of-hera-top', dungeon: 'Tower of Hera', vanillaItem: 'Red Pendant' },

  // ═══════════════════════════════════════════
  // Palace of Darkness
  // ═══════════════════════════════════════════
  { id: 'Palace of Darkness - Shooter Room', name: 'Shooter Room', type: 'chest', screen: 'palace-of-darkness-entrance', dungeon: 'Palace of Darkness', vanillaItem: 'Small Key' },
  { id: 'Palace of Darkness - The Arena - Bridge', name: 'The Arena - Bridge', type: 'chest', screen: 'palace-of-darkness-center', dungeon: 'Palace of Darkness', vanillaItem: 'Small Key' },
  { id: 'Palace of Darkness - Stalfos Basement', name: 'Stalfos Basement', type: 'chest', screen: 'palace-of-darkness-center', dungeon: 'Palace of Darkness', vanillaItem: 'Small Key' },
  { id: 'Palace of Darkness - Big Key Chest', name: 'Big Key Chest', type: 'chest', screen: 'palace-of-darkness-big-key-chest', dungeon: 'Palace of Darkness', vanillaItem: 'Big Key' },
  { id: 'Palace of Darkness - The Arena - Ledge', name: 'The Arena - Ledge', type: 'chest', screen: 'palace-of-darkness-bonk-section', dungeon: 'Palace of Darkness', vanillaItem: 'Small Key' },
  { id: 'Palace of Darkness - Map Chest', name: 'Map Chest', type: 'chest', screen: 'palace-of-darkness-bonk-section', dungeon: 'Palace of Darkness', vanillaItem: 'Map' },
  { id: 'Palace of Darkness - Compass Chest', name: 'Compass Chest', type: 'chest', screen: 'palace-of-darkness-north', dungeon: 'Palace of Darkness', vanillaItem: 'Compass' },
  { id: 'Palace of Darkness - Dark Basement - Left', name: 'Dark Basement - Left', type: 'chest', screen: 'palace-of-darkness-north', dungeon: 'Palace of Darkness', vanillaItem: '10 Arrows' },
  { id: 'Palace of Darkness - Dark Basement - Right', name: 'Dark Basement - Right', type: 'chest', screen: 'palace-of-darkness-north', dungeon: 'Palace of Darkness', vanillaItem: 'Small Key' },
  { id: 'Palace of Darkness - Dark Maze - Top', name: 'Dark Maze - Top', type: 'chest', screen: 'palace-of-darkness-maze', dungeon: 'Palace of Darkness', vanillaItem: '3 Bombs' },
  { id: 'Palace of Darkness - Dark Maze - Bottom', name: 'Dark Maze - Bottom', type: 'chest', screen: 'palace-of-darkness-maze', dungeon: 'Palace of Darkness', vanillaItem: 'Small Key' },
  { id: 'Palace of Darkness - Big Chest', name: 'Big Chest', type: 'chest', screen: 'palace-of-darkness-maze', dungeon: 'Palace of Darkness', vanillaItem: 'Hammer' },
  { id: 'Palace of Darkness - Harmless Hellway', name: 'Harmless Hellway', type: 'chest', screen: 'palace-of-darkness-harmless-hellway', dungeon: 'Palace of Darkness', vanillaItem: '5 Rupees' },
  { id: 'Palace of Darkness - Boss', name: 'Boss', type: 'boss', screen: 'palace-of-darkness-final-section', dungeon: 'Palace of Darkness', vanillaItem: 'Heart Container' },
  { id: 'Palace of Darkness - Prize', name: 'Prize', type: 'prize', screen: 'palace-of-darkness-final-section', dungeon: 'Palace of Darkness', vanillaItem: 'Crystal 1' },

  // ═══════════════════════════════════════════
  // Swamp Palace
  // ═══════════════════════════════════════════
  { id: 'Swamp Palace - Entrance', name: 'Entrance', type: 'chest', screen: 'swamp-palace-first-room', dungeon: 'Swamp Palace', vanillaItem: 'Small Key' },
  { id: 'Swamp Palace - Map Chest', name: 'Map Chest', type: 'chest', screen: 'swamp-palace-starting-area', dungeon: 'Swamp Palace', vanillaItem: 'Map' },
  { id: 'Swamp Palace - Big Chest', name: 'Big Chest', type: 'chest', screen: 'swamp-palace-center', dungeon: 'Swamp Palace', vanillaItem: 'Hookshot' },
  { id: 'Swamp Palace - Compass Chest', name: 'Compass Chest', type: 'chest', screen: 'swamp-palace-center', dungeon: 'Swamp Palace', vanillaItem: 'Compass' },
  { id: 'Swamp Palace - Big Key Chest', name: 'Big Key Chest', type: 'chest', screen: 'swamp-palace-west', dungeon: 'Swamp Palace', vanillaItem: 'Big Key' },
  { id: 'Swamp Palace - West Chest', name: 'West Chest', type: 'chest', screen: 'swamp-palace-west', dungeon: 'Swamp Palace', vanillaItem: '20 Rupees' },
  { id: 'Swamp Palace - Flooded Room - Left', name: 'Flooded Room - Left', type: 'chest', screen: 'swamp-palace-north', dungeon: 'Swamp Palace', vanillaItem: '20 Rupees' },
  { id: 'Swamp Palace - Flooded Room - Right', name: 'Flooded Room - Right', type: 'chest', screen: 'swamp-palace-north', dungeon: 'Swamp Palace', vanillaItem: '20 Rupees' },
  { id: 'Swamp Palace - Waterfall Room', name: 'Waterfall Room', type: 'chest', screen: 'swamp-palace-north', dungeon: 'Swamp Palace', vanillaItem: '20 Rupees' },
  { id: 'Swamp Palace - Boss', name: 'Boss', type: 'boss', screen: 'swamp-palace-north', dungeon: 'Swamp Palace', vanillaItem: 'Heart Container' },
  { id: 'Swamp Palace - Prize', name: 'Prize', type: 'prize', screen: 'swamp-palace-north', dungeon: 'Swamp Palace', vanillaItem: 'Crystal 2' },
  // Key drops
  { id: 'Swamp Palace - Pot Row Pot Key', name: 'Pot Row Pot Key', type: 'keyDrop', screen: 'swamp-palace-starting-area', dungeon: 'Swamp Palace', vanillaItem: 'Small Key (Swamp Palace)' },
  { id: 'Swamp Palace - Trench 1 Pot Key', name: 'Trench 1 Pot Key', type: 'keyDrop', screen: 'swamp-palace-starting-area', dungeon: 'Swamp Palace', vanillaItem: 'Small Key (Swamp Palace)' },
  { id: 'Swamp Palace - Hookshot Pot Key', name: 'Hookshot Pot Key', type: 'keyDrop', screen: 'swamp-palace-center', dungeon: 'Swamp Palace', vanillaItem: 'Small Key (Swamp Palace)' },
  { id: 'Swamp Palace - Trench 2 Pot Key', name: 'Trench 2 Pot Key', type: 'keyDrop', screen: 'swamp-palace-center', dungeon: 'Swamp Palace', vanillaItem: 'Small Key (Swamp Palace)' },
  { id: 'Swamp Palace - Waterway Pot Key', name: 'Waterway Pot Key', type: 'keyDrop', screen: 'swamp-palace-north', dungeon: 'Swamp Palace', vanillaItem: 'Small Key (Swamp Palace)' },

  // ═══════════════════════════════════════════
  // Thieves' Town
  // ═══════════════════════════════════════════
  { id: "Thieves' Town - Big Key Chest", name: 'Big Key Chest', type: 'chest', screen: 'thieves-town-entrance', dungeon: "Thieves' Town", vanillaItem: 'Big Key' },
  { id: "Thieves' Town - Map Chest", name: 'Map Chest', type: 'chest', screen: 'thieves-town-entrance', dungeon: "Thieves' Town", vanillaItem: 'Map' },
  { id: "Thieves' Town - Compass Chest", name: 'Compass Chest', type: 'chest', screen: 'thieves-town-entrance', dungeon: "Thieves' Town", vanillaItem: 'Compass' },
  { id: "Thieves' Town - Ambush Chest", name: 'Ambush Chest', type: 'chest', screen: 'thieves-town-entrance', dungeon: "Thieves' Town", vanillaItem: '20 Rupees' },
  { id: "Thieves' Town - Attic", name: 'Attic', type: 'chest', screen: 'thieves-town-deep', dungeon: "Thieves' Town", vanillaItem: 'Small Key' },
  { id: "Thieves' Town - Big Chest", name: 'Big Chest', type: 'chest', screen: 'thieves-town-deep', dungeon: "Thieves' Town", vanillaItem: 'Titans Mitts' },
  { id: "Thieves' Town - Blind's Cell", name: "Blind's Cell", type: 'chest', screen: 'thieves-town-deep', dungeon: "Thieves' Town", vanillaItem: '20 Rupees' },
  { id: "Thieves' Town - Boss", name: 'Boss', type: 'boss', screen: 'blind-fight', dungeon: "Thieves' Town", vanillaItem: 'Heart Container' },
  { id: "Thieves' Town - Prize", name: 'Prize', type: 'prize', screen: 'blind-fight', dungeon: "Thieves' Town", vanillaItem: 'Crystal 4' },
  // Key drops
  { id: "Thieves' Town - Hallway Pot Key", name: 'Hallway Pot Key', type: 'keyDrop', screen: 'thieves-town-deep', dungeon: "Thieves' Town", vanillaItem: 'Small Key (Thieves Town)' },
  { id: "Thieves' Town - Spike Switch Pot Key", name: 'Spike Switch Pot Key', type: 'keyDrop', screen: 'thieves-town-deep', dungeon: "Thieves' Town", vanillaItem: 'Small Key (Thieves Town)' },

  // ═══════════════════════════════════════════
  // Skull Woods
  // ═══════════════════════════════════════════
  { id: 'Skull Woods - Compass Chest', name: 'Compass Chest', type: 'chest', screen: 'skull-woods-first-section-left', dungeon: 'Skull Woods', vanillaItem: 'Compass' },
  { id: 'Skull Woods - Map Chest', name: 'Map Chest', type: 'chest', screen: 'skull-woods-first-section', dungeon: 'Skull Woods', vanillaItem: 'Map' },
  { id: 'Skull Woods - Big Chest', name: 'Big Chest', type: 'chest', screen: 'skull-woods-first-section-top', dungeon: 'Skull Woods', vanillaItem: 'Fire Rod' },
  { id: 'Skull Woods - Pot Prison', name: 'Pot Prison', type: 'chest', screen: 'skull-woods-first-section-left', dungeon: 'Skull Woods', vanillaItem: '5 Rupees' },
  { id: 'Skull Woods - Pinball Room', name: 'Pinball Room', type: 'chest', screen: 'skull-woods-first-section-right', dungeon: 'Skull Woods', vanillaItem: 'Small Key' },
  { id: 'Skull Woods - Big Key Chest', name: 'Big Key Chest', type: 'chest', screen: 'skull-woods-second-section', dungeon: 'Skull Woods', vanillaItem: 'Big Key' },
  { id: 'Skull Woods - Bridge Room', name: 'Bridge Room', type: 'chest', screen: 'skull-woods-final-section-entrance', dungeon: 'Skull Woods', vanillaItem: 'Small Key' },
  { id: 'Skull Woods - Boss', name: 'Boss', type: 'boss', screen: 'skull-woods-final-section-mothula', dungeon: 'Skull Woods', vanillaItem: 'Heart Container' },
  { id: 'Skull Woods - Prize', name: 'Prize', type: 'prize', screen: 'skull-woods-final-section-mothula', dungeon: 'Skull Woods', vanillaItem: 'Crystal 3' },
  // Key drops
  { id: 'Skull Woods - West Lobby Pot Key', name: 'West Lobby Pot Key', type: 'keyDrop', screen: 'skull-woods-second-section', dungeon: 'Skull Woods', vanillaItem: 'Small Key (Skull Woods)' },
  { id: 'Skull Woods - Spike Corner Key Drop', name: 'Spike Corner Key Drop', type: 'keyDrop', screen: 'skull-woods-final-section-mothula', dungeon: 'Skull Woods', vanillaItem: 'Small Key (Skull Woods)' },

  // ═══════════════════════════════════════════
  // Ice Palace
  // ═══════════════════════════════════════════
  { id: 'Ice Palace - Compass Chest', name: 'Compass Chest', type: 'chest', screen: 'ice-palace-entrance', dungeon: 'Ice Palace', vanillaItem: 'Compass' },
  { id: 'Ice Palace - Freezor Chest', name: 'Freezor Chest', type: 'chest', screen: 'ice-palace-main', dungeon: 'Ice Palace', vanillaItem: '50 Rupees' },
  { id: 'Ice Palace - Big Chest', name: 'Big Chest', type: 'chest', screen: 'ice-palace-main', dungeon: 'Ice Palace', vanillaItem: 'Blue Mail' },
  { id: 'Ice Palace - Iced T Room', name: 'Iced T Room', type: 'chest', screen: 'ice-palace-main', dungeon: 'Ice Palace', vanillaItem: '5 Rupees' },
  { id: 'Ice Palace - Spike Room', name: 'Spike Room', type: 'chest', screen: 'ice-palace-east', dungeon: 'Ice Palace', vanillaItem: '20 Rupees' },
  { id: 'Ice Palace - Big Key Chest', name: 'Big Key Chest', type: 'chest', screen: 'ice-palace-east-top', dungeon: 'Ice Palace', vanillaItem: 'Big Key' },
  { id: 'Ice Palace - Map Chest', name: 'Map Chest', type: 'chest', screen: 'ice-palace-east-top', dungeon: 'Ice Palace', vanillaItem: 'Map' },
  { id: 'Ice Palace - Boss', name: 'Boss', type: 'boss', screen: 'ice-palace-kholdstare', dungeon: 'Ice Palace', vanillaItem: 'Heart Container' },
  { id: 'Ice Palace - Prize', name: 'Prize', type: 'prize', screen: 'ice-palace-kholdstare', dungeon: 'Ice Palace', vanillaItem: 'Crystal 5' },
  // Key drops
  { id: 'Ice Palace - Jelly Key Drop', name: 'Jelly Key Drop', type: 'keyDrop', screen: 'ice-palace-entrance', dungeon: 'Ice Palace', vanillaItem: 'Small Key (Ice Palace)' },
  { id: 'Ice Palace - Conveyor Key Drop', name: 'Conveyor Key Drop', type: 'keyDrop', screen: 'ice-palace-second-section', dungeon: 'Ice Palace', vanillaItem: 'Small Key (Ice Palace)' },
  { id: 'Ice Palace - Hammer Block Key Drop', name: 'Hammer Block Key Drop', type: 'keyDrop', screen: 'ice-palace-east-top', dungeon: 'Ice Palace', vanillaItem: 'Small Key (Ice Palace)' },
  { id: 'Ice Palace - Many Pots Pot Key', name: 'Many Pots Pot Key', type: 'keyDrop', screen: 'ice-palace-main', dungeon: 'Ice Palace', vanillaItem: 'Small Key (Ice Palace)' },

  // ═══════════════════════════════════════════
  // Misery Mire
  // ═══════════════════════════════════════════
  { id: 'Misery Mire - Big Chest', name: 'Big Chest', type: 'chest', screen: 'misery-mire-main', dungeon: 'Misery Mire', vanillaItem: 'Cane of Somaria' },
  { id: 'Misery Mire - Map Chest', name: 'Map Chest', type: 'chest', screen: 'misery-mire-main', dungeon: 'Misery Mire', vanillaItem: 'Map' },
  { id: 'Misery Mire - Main Lobby', name: 'Main Lobby', type: 'chest', screen: 'misery-mire-main', dungeon: 'Misery Mire', vanillaItem: 'Small Key' },
  { id: 'Misery Mire - Bridge Chest', name: 'Bridge Chest', type: 'chest', screen: 'misery-mire-main', dungeon: 'Misery Mire', vanillaItem: 'Small Key' },
  { id: 'Misery Mire - Spike Chest', name: 'Spike Chest', type: 'chest', screen: 'misery-mire-main', dungeon: 'Misery Mire', vanillaItem: '50 Rupees' },
  { id: 'Misery Mire - Compass Chest', name: 'Compass Chest', type: 'chest', screen: 'misery-mire-west', dungeon: 'Misery Mire', vanillaItem: 'Compass' },
  { id: 'Misery Mire - Big Key Chest', name: 'Big Key Chest', type: 'chest', screen: 'misery-mire-west', dungeon: 'Misery Mire', vanillaItem: 'Big Key' },
  { id: 'Misery Mire - Boss', name: 'Boss', type: 'boss', screen: 'misery-mire-vitreous', dungeon: 'Misery Mire', vanillaItem: 'Heart Container' },
  { id: 'Misery Mire - Prize', name: 'Prize', type: 'prize', screen: 'misery-mire-vitreous', dungeon: 'Misery Mire', vanillaItem: 'Crystal 6' },
  // Key drops
  { id: 'Misery Mire - Spikes Pot Key', name: 'Spikes Pot Key', type: 'keyDrop', screen: 'misery-mire-main', dungeon: 'Misery Mire', vanillaItem: 'Small Key (Misery Mire)' },
  { id: 'Misery Mire - Fishbone Pot Key', name: 'Fishbone Pot Key', type: 'keyDrop', screen: 'misery-mire-main', dungeon: 'Misery Mire', vanillaItem: 'Small Key (Misery Mire)' },
  { id: 'Misery Mire - Conveyor Crystal Key Drop', name: 'Conveyor Crystal Key Drop', type: 'keyDrop', screen: 'misery-mire-main', dungeon: 'Misery Mire', vanillaItem: 'Small Key (Misery Mire)' },

  // ═══════════════════════════════════════════
  // Turtle Rock
  // ═══════════════════════════════════════════
  { id: 'Turtle Rock - Compass Chest', name: 'Compass Chest', type: 'chest', screen: 'turtle-rock-first-section', dungeon: 'Turtle Rock', vanillaItem: 'Compass' },
  { id: 'Turtle Rock - Roller Room - Left', name: 'Roller Room - Left', type: 'chest', screen: 'turtle-rock-first-section', dungeon: 'Turtle Rock', vanillaItem: 'Small Key' },
  { id: 'Turtle Rock - Roller Room - Right', name: 'Roller Room - Right', type: 'chest', screen: 'turtle-rock-first-section', dungeon: 'Turtle Rock', vanillaItem: 'Small Key' },
  { id: 'Turtle Rock - Chain Chomps', name: 'Chain Chomps', type: 'chest', screen: 'turtle-rock-chain-chomp-room', dungeon: 'Turtle Rock', vanillaItem: '10 Arrows' },
  { id: 'Turtle Rock - Big Key Chest', name: 'Big Key Chest', type: 'chest', screen: 'turtle-rock-second-section', dungeon: 'Turtle Rock', vanillaItem: 'Big Key' },
  { id: 'Turtle Rock - Big Chest', name: 'Big Chest', type: 'chest', screen: 'turtle-rock-big-chest', dungeon: 'Turtle Rock', vanillaItem: 'Mirror Shield' },
  { id: 'Turtle Rock - Crystaroller Room', name: 'Crystaroller Room', type: 'chest', screen: 'turtle-rock-crystaroller-room', dungeon: 'Turtle Rock', vanillaItem: 'Small Key' },
  { id: 'Turtle Rock - Eye Bridge - Bottom Left', name: 'Eye Bridge - Bottom Left', type: 'chest', screen: 'turtle-rock-eye-bridge', dungeon: 'Turtle Rock', vanillaItem: 'Small Key' },
  { id: 'Turtle Rock - Eye Bridge - Bottom Right', name: 'Eye Bridge - Bottom Right', type: 'chest', screen: 'turtle-rock-eye-bridge', dungeon: 'Turtle Rock', vanillaItem: '5 Rupees' },
  { id: 'Turtle Rock - Eye Bridge - Top Left', name: 'Eye Bridge - Top Left', type: 'chest', screen: 'turtle-rock-eye-bridge', dungeon: 'Turtle Rock', vanillaItem: '20 Rupees' },
  { id: 'Turtle Rock - Eye Bridge - Top Right', name: 'Eye Bridge - Top Right', type: 'chest', screen: 'turtle-rock-eye-bridge', dungeon: 'Turtle Rock', vanillaItem: 'Map' },
  { id: 'Turtle Rock - Boss', name: 'Boss', type: 'boss', screen: 'turtle-rock-trinexx', dungeon: 'Turtle Rock', vanillaItem: 'Heart Container' },
  { id: 'Turtle Rock - Prize', name: 'Prize', type: 'prize', screen: 'turtle-rock-trinexx', dungeon: 'Turtle Rock', vanillaItem: 'Crystal 7' },
  // Key drops
  { id: 'Turtle Rock - Pokey 1 Key Drop', name: 'Pokey 1 Key Drop', type: 'keyDrop', screen: 'turtle-rock-pokey-room', dungeon: 'Turtle Rock', vanillaItem: 'Small Key (Turtle Rock)' },
  { id: 'Turtle Rock - Pokey 2 Key Drop', name: 'Pokey 2 Key Drop', type: 'keyDrop', screen: 'turtle-rock-second-section', dungeon: 'Turtle Rock', vanillaItem: 'Small Key (Turtle Rock)' },

  // ═══════════════════════════════════════════
  // Ganon's Tower
  // ═══════════════════════════════════════════
  { id: "Ganons Tower - Bob's Torch", name: "Bob's Torch", type: 'standing', screen: 'ganons-tower-entrance', dungeon: "Ganon's Tower", vanillaItem: 'Small Key' },
  { id: 'Ganons Tower - Hope Room - Left', name: 'Hope Room - Left', type: 'chest', screen: 'ganons-tower-entrance', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: 'Ganons Tower - Hope Room - Right', name: 'Hope Room - Right', type: 'chest', screen: 'ganons-tower-entrance', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: 'Ganons Tower - Tile Room', name: 'Tile Room', type: 'chest', screen: 'ganons-tower-tile-room', dungeon: "Ganon's Tower", vanillaItem: 'Small Key' },
  { id: 'Ganons Tower - Compass Room - Top Left', name: 'Compass Room - Top Left', type: 'chest', screen: 'ganons-tower-compass-room', dungeon: "Ganon's Tower", vanillaItem: 'Compass' },
  { id: 'Ganons Tower - Compass Room - Top Right', name: 'Compass Room - Top Right', type: 'chest', screen: 'ganons-tower-compass-room', dungeon: "Ganon's Tower", vanillaItem: '10 Bombs' },
  { id: 'Ganons Tower - Compass Room - Bottom Left', name: 'Compass Room - Bottom Left', type: 'chest', screen: 'ganons-tower-compass-room', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: 'Ganons Tower - Compass Room - Bottom Right', name: 'Compass Room - Bottom Right', type: 'chest', screen: 'ganons-tower-compass-room', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: 'Ganons Tower - DMs Room - Top Left', name: 'DMs Room - Top Left', type: 'chest', screen: 'ganons-tower-hookshot-room', dungeon: "Ganon's Tower", vanillaItem: '10 Bombs' },
  { id: 'Ganons Tower - DMs Room - Top Right', name: 'DMs Room - Top Right', type: 'chest', screen: 'ganons-tower-hookshot-room', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: 'Ganons Tower - DMs Room - Bottom Left', name: 'DMs Room - Bottom Left', type: 'chest', screen: 'ganons-tower-hookshot-room', dungeon: "Ganon's Tower", vanillaItem: '10 Bombs' },
  { id: 'Ganons Tower - DMs Room - Bottom Right', name: 'DMs Room - Bottom Right', type: 'chest', screen: 'ganons-tower-hookshot-room', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: 'Ganons Tower - Map Chest', name: 'Map Chest', type: 'chest', screen: 'ganons-tower-map-room', dungeon: "Ganon's Tower", vanillaItem: 'Map' },
  { id: 'Ganons Tower - Firesnake Room', name: 'Firesnake Room', type: 'chest', screen: 'ganons-tower-firesnake-room', dungeon: "Ganon's Tower", vanillaItem: 'Small Key' },
  { id: 'Ganons Tower - Randomizer Room - Top Left', name: 'Randomizer Room - Top Left', type: 'chest', screen: 'ganons-tower-teleport-room', dungeon: "Ganon's Tower", vanillaItem: '10 Bombs' },
  { id: 'Ganons Tower - Randomizer Room - Top Right', name: 'Randomizer Room - Top Right', type: 'chest', screen: 'ganons-tower-teleport-room', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: 'Ganons Tower - Randomizer Room - Bottom Left', name: 'Randomizer Room - Bottom Left', type: 'chest', screen: 'ganons-tower-teleport-room', dungeon: "Ganon's Tower", vanillaItem: '10 Bombs' },
  { id: 'Ganons Tower - Randomizer Room - Bottom Right', name: 'Randomizer Room - Bottom Right', type: 'chest', screen: 'ganons-tower-teleport-room', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: "Ganons Tower - Bob's Chest", name: "Bob's Chest", type: 'chest', screen: 'ganons-tower-bottom', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: 'Ganons Tower - Big Chest', name: 'Big Chest', type: 'chest', screen: 'ganons-tower-bottom', dungeon: "Ganon's Tower", vanillaItem: 'Red Mail' },
  { id: 'Ganons Tower - Big Key Room - Left', name: 'Big Key Room - Left', type: 'chest', screen: 'ganons-tower-bottom', dungeon: "Ganon's Tower", vanillaItem: '10 Bombs' },
  { id: 'Ganons Tower - Big Key Room - Right', name: 'Big Key Room - Right', type: 'chest', screen: 'ganons-tower-bottom', dungeon: "Ganon's Tower", vanillaItem: '10 Bombs' },
  { id: 'Ganons Tower - Big Key Chest', name: 'Big Key Chest', type: 'chest', screen: 'ganons-tower-bottom', dungeon: "Ganon's Tower", vanillaItem: 'Big Key' },
  { id: 'Ganons Tower - Mini Helmasaur Room - Left', name: 'Mini Helmasaur Room - Left', type: 'chest', screen: 'ganons-tower-before-moldorm', dungeon: "Ganon's Tower", vanillaItem: '3 Bombs' },
  { id: 'Ganons Tower - Mini Helmasaur Room - Right', name: 'Mini Helmasaur Room - Right', type: 'chest', screen: 'ganons-tower-before-moldorm', dungeon: "Ganon's Tower", vanillaItem: '10 Arrows' },
  { id: 'Ganons Tower - Pre-Moldorm Chest', name: 'Pre-Moldorm Chest', type: 'chest', screen: 'ganons-tower-before-moldorm', dungeon: "Ganon's Tower", vanillaItem: 'Small Key' },
  { id: 'Ganons Tower - Validation Chest', name: 'Validation Chest', type: 'chest', screen: 'agahnim-2', dungeon: "Ganon's Tower", vanillaItem: '300 Rupees' },
  // Key drops
  { id: 'Ganons Tower - Conveyor Cross Pot Key', name: 'Conveyor Cross Pot Key', type: 'keyDrop', screen: 'ganons-tower-entrance', dungeon: "Ganon's Tower", vanillaItem: 'Small Key (Ganons Tower)' },
  { id: 'Ganons Tower - Double Switch Pot Key', name: 'Double Switch Pot Key', type: 'keyDrop', screen: 'ganons-tower-hookshot-room', dungeon: "Ganon's Tower", vanillaItem: 'Small Key (Ganons Tower)' },
  { id: 'Ganons Tower - Conveyor Star Pits Pot Key', name: 'Conveyor Star Pits Pot Key', type: 'keyDrop', screen: 'ganons-tower-compass-room', dungeon: "Ganon's Tower", vanillaItem: 'Small Key (Ganons Tower)' },
  { id: 'Ganons Tower - Mini Helmasaur Key Drop', name: 'Mini Helmasaur Key Drop', type: 'keyDrop', screen: 'ganons-tower-before-moldorm', dungeon: "Ganon's Tower", vanillaItem: 'Small Key (Ganons Tower)' },
];

export { DUNGEON_CHECKS };
