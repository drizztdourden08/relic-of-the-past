/* @layer shared-game @kind data */
/**
 * Maps check IDs to their SRAM room flag location in save_dung_info[].
 * save_dung_info is uint16[320], indexed by room ID.
 *
 * Two detection modes:
 *   1. Chest-based: uses chestIndex → CHEST_OPEN_MASKS[chestIndex]
 *   2. Direct mask: uses a raw bit mask (for key drops, bosses, standing items)
 *
 * Bit layout of save_dung_info[roomId] (stored format):
 *   Bit 4  (0x0010): Chest 0
 *   Bit 5  (0x0020): Chest 1
 *   Bit 6  (0x0040): Chest 2
 *   Bit 7  (0x0080): Chest 3
 *   Bit 8  (0x0100): Chest 4
 *   Bit 9  (0x0200): Chest 5 / some standing items
 *   Bit 10 (0x0400): Key drop / standing torch / special item
 *   Bit 11 (0x0800): Boss defeated / heart piece / key item
 */
interface RoomFlagEntry {
  roomId: number;
  chestIndex: number;
}

interface DirectRoomFlagEntry {
  roomId: number;
  mask: number;
}

/** Chest-open bit masks indexed by chestIndex (0-5) for save_dung_info format. */
const CHEST_OPEN_MASKS = [0x10, 0x20, 0x40, 0x80, 0x100, 0x200] as const;

/**
 * Chest-type checks: detected via CHEST_OPEN_MASKS[chestIndex].
 */
const CHECK_ROOM_FLAGS: Record<string, RoomFlagEntry> = {
  // ═══════════════════════════════════════════
  // Hyrule Castle / Sewers
  // ═══════════════════════════════════════════
  'Secret Passage': { roomId: 0x55, chestIndex: 0 },
  'Hyrule Castle - Boomerang Chest': { roomId: 0x71, chestIndex: 0 },
  'Hyrule Castle - Map Chest': { roomId: 0x72, chestIndex: 0 },
  "Hyrule Castle - Zelda's Chest": { roomId: 0x80, chestIndex: 0 },
  'Sewers - Dark Cross': { roomId: 0x32, chestIndex: 0 },
  'Sewers - Secret Room - Left': { roomId: 0x11, chestIndex: 0 },
  'Sewers - Secret Room - Middle': { roomId: 0x11, chestIndex: 1 },
  'Sewers - Secret Room - Right': { roomId: 0x11, chestIndex: 2 },
  'Sanctuary': { roomId: 0x12, chestIndex: 0 },

  // ═══════════════════════════════════════════
  // Light World Caves
  // ═══════════════════════════════════════════
  "Link's House": { roomId: 0x104, chestIndex: 0 },
  'Kakariko Tavern': { roomId: 0x103, chestIndex: 0 },
  'Chicken House': { roomId: 0x108, chestIndex: 0 },
  "Aginah's Cave": { roomId: 0x10a, chestIndex: 0 },
  "Sahasrahla's Hut - Left": { roomId: 0x105, chestIndex: 0 },
  "Sahasrahla's Hut - Middle": { roomId: 0x105, chestIndex: 1 },
  "Sahasrahla's Hut - Right": { roomId: 0x105, chestIndex: 2 },
  'Kakariko Well - Top': { roomId: 0x2f, chestIndex: 0 },
  'Kakariko Well - Left': { roomId: 0x2f, chestIndex: 1 },
  'Kakariko Well - Middle': { roomId: 0x2f, chestIndex: 2 },
  'Kakariko Well - Right': { roomId: 0x2f, chestIndex: 3 },
  'Kakariko Well - Bottom': { roomId: 0x2f, chestIndex: 4 },
  "Blind's Hideout - Top": { roomId: 0x11d, chestIndex: 0 },
  "Blind's Hideout - Left": { roomId: 0x11d, chestIndex: 1 },
  "Blind's Hideout - Right": { roomId: 0x11d, chestIndex: 2 },
  "Blind's Hideout - Far Left": { roomId: 0x11d, chestIndex: 3 },
  "Blind's Hideout - Far Right": { roomId: 0x11d, chestIndex: 4 },
  'Graveyard Cave': { roomId: 0x11b, chestIndex: 0 },
  'Checkerboard Cave': { roomId: 0x126, chestIndex: 0 },
  'Mini Moldorm Cave - Far Left': { roomId: 0x123, chestIndex: 0 },
  'Mini Moldorm Cave - Left': { roomId: 0x123, chestIndex: 1 },
  'Mini Moldorm Cave - Right': { roomId: 0x123, chestIndex: 2 },
  'Mini Moldorm Cave - Far Right': { roomId: 0x123, chestIndex: 3 },
  'Ice Rod Cave': { roomId: 0x120, chestIndex: 0 },
  'Bonk Rock Cave': { roomId: 0x124, chestIndex: 0 },
  'Waterfall Fairy - Left': { roomId: 0x114, chestIndex: 0 },
  'Waterfall Fairy - Right': { roomId: 0x114, chestIndex: 1 },
  "King's Tomb": { roomId: 0x113, chestIndex: 0 },
  'Floodgate Chest': { roomId: 0x10b, chestIndex: 0 },
  'Spectacle Rock Cave': { roomId: 0xfa, chestIndex: 0 },
  'Paradox Cave Lower - Far Left': { roomId: 0xef, chestIndex: 0 },
  'Paradox Cave Lower - Left': { roomId: 0xef, chestIndex: 1 },
  'Paradox Cave Lower - Right': { roomId: 0xef, chestIndex: 2 },
  'Paradox Cave Lower - Far Right': { roomId: 0xef, chestIndex: 3 },
  'Paradox Cave Lower - Middle': { roomId: 0xef, chestIndex: 4 },
  'Paradox Cave Upper - Left': { roomId: 0xff, chestIndex: 0 },
  'Paradox Cave Upper - Right': { roomId: 0xff, chestIndex: 1 },
  'Spiral Cave': { roomId: 0xfe, chestIndex: 0 },
  'Mimic Cave': { roomId: 0x10c, chestIndex: 0 },
  'Spike Cave': { roomId: 0x117, chestIndex: 0 },

  // ═══════════════════════════════════════════
  // Castle Tower
  // ═══════════════════════════════════════════
  'Castle Tower - Room 03': { roomId: 0xe0, chestIndex: 0 },
  'Castle Tower - Dark Maze': { roomId: 0xd0, chestIndex: 0 },

  // ═══════════════════════════════════════════
  // Eastern Palace
  // ═══════════════════════════════════════════
  'Eastern Palace - Compass Chest': { roomId: 0xa8, chestIndex: 0 },
  'Eastern Palace - Big Chest': { roomId: 0xa9, chestIndex: 0 },
  'Eastern Palace - Cannonball Chest': { roomId: 0xb9, chestIndex: 0 },
  'Eastern Palace - Big Key Chest': { roomId: 0xb8, chestIndex: 0 },
  'Eastern Palace - Map Chest': { roomId: 0xaa, chestIndex: 0 },

  // ═══════════════════════════════════════════
  // Desert Palace
  // ═══════════════════════════════════════════
  'Desert Palace - Map Chest': { roomId: 0x74, chestIndex: 0 },
  'Desert Palace - Compass Chest': { roomId: 0x85, chestIndex: 0 },
  'Desert Palace - Big Chest': { roomId: 0x73, chestIndex: 0 },
  'Desert Palace - Big Key Chest': { roomId: 0x75, chestIndex: 0 },

  // ═══════════════════════════════════════════
  // Tower of Hera
  // ═══════════════════════════════════════════
  'Tower of Hera - Basement Cage': { roomId: 0x87, chestIndex: 1 },
  'Tower of Hera - Map Chest': { roomId: 0x77, chestIndex: 0 },
  'Tower of Hera - Big Key Chest': { roomId: 0x87, chestIndex: 0 },
  'Tower of Hera - Compass Chest': { roomId: 0x27, chestIndex: 0 },
  'Tower of Hera - Big Chest': { roomId: 0x27, chestIndex: 1 },

  // ═══════════════════════════════════════════
  // Palace of Darkness
  // ═══════════════════════════════════════════
  'Palace of Darkness - Shooter Room': { roomId: 0x09, chestIndex: 0 },
  'Palace of Darkness - Big Key Chest': { roomId: 0x3a, chestIndex: 0 },
  'Palace of Darkness - The Arena - Ledge': { roomId: 0x2a, chestIndex: 0 },
  'Palace of Darkness - The Arena - Bridge': { roomId: 0x2a, chestIndex: 1 },
  'Palace of Darkness - Stalfos Basement': { roomId: 0x0a, chestIndex: 0 },
  'Palace of Darkness - Map Chest': { roomId: 0x2b, chestIndex: 0 },
  'Palace of Darkness - Big Chest': { roomId: 0x1a, chestIndex: 0 },
  'Palace of Darkness - Compass Chest': { roomId: 0x1a, chestIndex: 1 },
  'Palace of Darkness - Harmless Hellway': { roomId: 0x1a, chestIndex: 2 },
  'Palace of Darkness - Dark Basement - Left': { roomId: 0x6a, chestIndex: 0 },
  'Palace of Darkness - Dark Basement - Right': { roomId: 0x6a, chestIndex: 1 },
  'Palace of Darkness - Dark Maze - Top': { roomId: 0x19, chestIndex: 0 },
  'Palace of Darkness - Dark Maze - Bottom': { roomId: 0x19, chestIndex: 1 },

  // ═══════════════════════════════════════════
  // Swamp Palace
  // ═══════════════════════════════════════════
  'Swamp Palace - Entrance': { roomId: 0x28, chestIndex: 0 },
  'Swamp Palace - Map Chest': { roomId: 0x37, chestIndex: 0 },
  'Swamp Palace - Big Chest': { roomId: 0x36, chestIndex: 0 },
  'Swamp Palace - Compass Chest': { roomId: 0x46, chestIndex: 0 },
  'Swamp Palace - Big Key Chest': { roomId: 0x35, chestIndex: 0 },
  'Swamp Palace - West Chest': { roomId: 0x34, chestIndex: 0 },
  'Swamp Palace - Flooded Room - Left': { roomId: 0x76, chestIndex: 0 },
  'Swamp Palace - Flooded Room - Right': { roomId: 0x76, chestIndex: 1 },
  'Swamp Palace - Waterfall Room': { roomId: 0x66, chestIndex: 0 },

  // ═══════════════════════════════════════════
  // Skull Woods
  // ═══════════════════════════════════════════
  'Skull Woods - Map Chest': { roomId: 0x58, chestIndex: 0 },
  'Skull Woods - Big Chest': { roomId: 0x58, chestIndex: 1 },
  'Skull Woods - Compass Chest': { roomId: 0x67, chestIndex: 0 },
  'Skull Woods - Pot Prison': { roomId: 0x57, chestIndex: 0 },
  'Skull Woods - Pinball Room': { roomId: 0x68, chestIndex: 0 },
  'Skull Woods - Big Key Chest': { roomId: 0x57, chestIndex: 1 },
  'Skull Woods - Bridge Room': { roomId: 0x59, chestIndex: 0 },

  // ═══════════════════════════════════════════
  // Thieves' Town
  // ═══════════════════════════════════════════
  "Thieves' Town - Map Chest": { roomId: 0xdb, chestIndex: 0 },
  "Thieves' Town - Ambush Chest": { roomId: 0xcb, chestIndex: 0 },
  "Thieves' Town - Compass Chest": { roomId: 0xdc, chestIndex: 0 },
  "Thieves' Town - Big Key Chest": { roomId: 0xdb, chestIndex: 1 },
  "Thieves' Town - Attic": { roomId: 0x65, chestIndex: 0 },
  "Thieves' Town - Big Chest": { roomId: 0x44, chestIndex: 0 },
  "Thieves' Town - Blind's Cell": { roomId: 0x45, chestIndex: 0 },

  // ═══════════════════════════════════════════
  // Ice Palace
  // ═══════════════════════════════════════════
  'Ice Palace - Compass Chest': { roomId: 0x2e, chestIndex: 0 },
  'Ice Palace - Map Chest': { roomId: 0x3f, chestIndex: 0 },
  'Ice Palace - Big Key Chest': { roomId: 0x1f, chestIndex: 0 },
  'Ice Palace - Iced T Room': { roomId: 0xae, chestIndex: 0 },
  'Ice Palace - Big Chest': { roomId: 0x9e, chestIndex: 0 },
  'Ice Palace - Freezor Chest': { roomId: 0x7e, chestIndex: 0 },
  'Ice Palace - Spike Room': { roomId: 0x5e, chestIndex: 0 },

  // ═══════════════════════════════════════════
  // Misery Mire
  // ═══════════════════════════════════════════
  'Misery Mire - Map Chest': { roomId: 0xc3, chestIndex: 0 },
  'Misery Mire - Main Lobby': { roomId: 0xc2, chestIndex: 0 },
  'Misery Mire - Big Chest': { roomId: 0xc3, chestIndex: 1 },
  'Misery Mire - Compass Chest': { roomId: 0xc1, chestIndex: 0 },
  'Misery Mire - Big Key Chest': { roomId: 0xd1, chestIndex: 0 },
  'Misery Mire - Bridge Chest': { roomId: 0xa2, chestIndex: 0 },
  'Misery Mire - Spike Chest': { roomId: 0xb3, chestIndex: 0 },

  // ═══════════════════════════════════════════
  // Turtle Rock
  // ═══════════════════════════════════════════
  'Turtle Rock - Compass Chest': { roomId: 0xd6, chestIndex: 0 },
  'Turtle Rock - Chain Chomps': { roomId: 0xb6, chestIndex: 0 },
  'Turtle Rock - Big Key Chest': { roomId: 0x14, chestIndex: 0 },
  'Turtle Rock - Big Chest': { roomId: 0x24, chestIndex: 0 },
  'Turtle Rock - Roller Room - Left': { roomId: 0xb7, chestIndex: 0 },
  'Turtle Rock - Roller Room - Right': { roomId: 0xb7, chestIndex: 1 },
  'Turtle Rock - Eye Bridge - Top Right': { roomId: 0xd5, chestIndex: 0 },
  'Turtle Rock - Eye Bridge - Top Left': { roomId: 0xd5, chestIndex: 1 },
  'Turtle Rock - Eye Bridge - Bottom Right': { roomId: 0xd5, chestIndex: 2 },
  'Turtle Rock - Eye Bridge - Bottom Left': { roomId: 0xd5, chestIndex: 3 },
  'Turtle Rock - Crystaroller Room': { roomId: 0x04, chestIndex: 0 },

  // ═══════════════════════════════════════════
  // Ganon's Tower
  // ═══════════════════════════════════════════
  'Ganons Tower - Hope Room - Left': { roomId: 0x8c, chestIndex: 1 },
  'Ganons Tower - Hope Room - Right': { roomId: 0x8c, chestIndex: 2 },
  'Ganons Tower - DMs Room - Top Left': { roomId: 0x7c, chestIndex: 0 },
  'Ganons Tower - DMs Room - Top Right': { roomId: 0x7c, chestIndex: 1 },
  'Ganons Tower - DMs Room - Bottom Left': { roomId: 0x7c, chestIndex: 2 },
  'Ganons Tower - DMs Room - Bottom Right': { roomId: 0x7c, chestIndex: 3 },
  'Ganons Tower - Map Chest': { roomId: 0x8b, chestIndex: 0 },
  'Ganons Tower - Firesnake Room': { roomId: 0x7d, chestIndex: 0 },
  'Ganons Tower - Randomizer Room - Top Left': { roomId: 0x7b, chestIndex: 0 },
  'Ganons Tower - Randomizer Room - Top Right': { roomId: 0x7b, chestIndex: 1 },
  'Ganons Tower - Randomizer Room - Bottom Left': { roomId: 0x7b, chestIndex: 2 },
  'Ganons Tower - Randomizer Room - Bottom Right': { roomId: 0x7b, chestIndex: 3 },
  'Ganons Tower - Tile Room': { roomId: 0x8d, chestIndex: 0 },
  'Ganons Tower - Compass Room - Top Left': { roomId: 0x9d, chestIndex: 0 },
  'Ganons Tower - Compass Room - Top Right': { roomId: 0x9d, chestIndex: 1 },
  'Ganons Tower - Compass Room - Bottom Left': { roomId: 0x9d, chestIndex: 2 },
  'Ganons Tower - Compass Room - Bottom Right': { roomId: 0x9d, chestIndex: 3 },
  'Ganons Tower - Big Chest': { roomId: 0x8c, chestIndex: 3 },
  "Ganons Tower - Bob's Chest": { roomId: 0x8c, chestIndex: 4 },
  'Ganons Tower - Big Key Chest': { roomId: 0x1c, chestIndex: 0 },
  'Ganons Tower - Big Key Room - Left': { roomId: 0x1c, chestIndex: 1 },
  'Ganons Tower - Big Key Room - Right': { roomId: 0x1c, chestIndex: 2 },
  'Ganons Tower - Mini Helmasaur Room - Left': { roomId: 0x3d, chestIndex: 0 },
  'Ganons Tower - Mini Helmasaur Room - Right': { roomId: 0x3d, chestIndex: 1 },
  'Ganons Tower - Pre-Moldorm Chest': { roomId: 0x3d, chestIndex: 2 },
  'Ganons Tower - Validation Chest': { roomId: 0x4d, chestIndex: 0 },

  // ═══════════════════════════════════════════
  // Dark World Caves
  // ═══════════════════════════════════════════
  'Pyramid Fairy - Left': { roomId: 0x116, chestIndex: 0 },
  'Pyramid Fairy - Right': { roomId: 0x116, chestIndex: 1 },
  'Brewery': { roomId: 0x106, chestIndex: 0 },
  'C-Shaped House': { roomId: 0x11c, chestIndex: 0 },
  'Chest Game': { roomId: 0x106, chestIndex: 1 },
  'Mire Shed - Left': { roomId: 0x10d, chestIndex: 0 },
  'Mire Shed - Right': { roomId: 0x10d, chestIndex: 1 },
  'Superbunny Cave - Top': { roomId: 0xf8, chestIndex: 0 },
  'Superbunny Cave - Bottom': { roomId: 0xf8, chestIndex: 1 },
  'Hookshot Cave - Top Right': { roomId: 0x3c, chestIndex: 0 },
  'Hookshot Cave - Top Left': { roomId: 0x3c, chestIndex: 1 },
  'Hookshot Cave - Bottom Right': { roomId: 0x3c, chestIndex: 2 },
  'Hookshot Cave - Bottom Left': { roomId: 0x3c, chestIndex: 3 },
  'Hype Cave - Top': { roomId: 0x11e, chestIndex: 0 },
  'Hype Cave - Middle Right': { roomId: 0x11e, chestIndex: 1 },
  'Hype Cave - Middle Left': { roomId: 0x11e, chestIndex: 2 },
  'Hype Cave - Bottom': { roomId: 0x11e, chestIndex: 3 },
};

/**
 * Direct-mask room flag checks: key drops, bosses, prizes, and standing items
 * that use specific bits in save_dung_info[roomId] rather than chestIndex.
 */
const DIRECT_ROOM_FLAGS: Record<string, DirectRoomFlagEntry> = {
  // ═══════════════════════════════════════════
  // Standing items (torches, ground items in dungeon rooms)
  // ═══════════════════════════════════════════
  'Desert Palace - Torch': { roomId: 0x73, mask: 0x400 },

  "Ganons Tower - Bob's Torch": { roomId: 0x8c, mask: 0x400 },
  'Lost Woods Hideout': { roomId: 0xe1, mask: 0x200 },
  'Lumberjack Tree': { roomId: 0xe2, mask: 0x200 },
  'Cave 45': { roomId: 0x11b, mask: 0x400 },
  'Peg Cave': { roomId: 0x127, mask: 0x400 },

  // ═══════════════════════════════════════════
  // Boss defeated (bit 11 = 0x800)
  // ═══════════════════════════════════════════
  'Eastern Palace - Boss': { roomId: 0xc8, mask: 0x800 },
  'Desert Palace - Boss': { roomId: 0x33, mask: 0x800 },
  'Tower of Hera - Boss': { roomId: 0x07, mask: 0x800 },
  'Palace of Darkness - Boss': { roomId: 0x5a, mask: 0x800 },
  'Swamp Palace - Boss': { roomId: 0x06, mask: 0x800 },
  "Thieves' Town - Boss": { roomId: 0xac, mask: 0x800 },
  'Skull Woods - Boss': { roomId: 0x29, mask: 0x800 },
  'Ice Palace - Boss': { roomId: 0xde, mask: 0x800 },
  'Misery Mire - Boss': { roomId: 0x90, mask: 0x800 },
  'Turtle Rock - Boss': { roomId: 0xa4, mask: 0x800 },
  'Ganon': { roomId: 0x00, mask: 0x800 },
  'Agahnim 1': { roomId: 0x20, mask: 0x800 },
  'Agahnim 2': { roomId: 0x0d, mask: 0x800 },

  // ═══════════════════════════════════════════
  // Prizes (same room as boss, bit 11)
  // ═══════════════════════════════════════════
  'Eastern Palace - Prize': { roomId: 0xc8, mask: 0x800 },
  'Desert Palace - Prize': { roomId: 0x33, mask: 0x800 },
  'Tower of Hera - Prize': { roomId: 0x07, mask: 0x800 },
  'Palace of Darkness - Prize': { roomId: 0x5a, mask: 0x800 },
  'Swamp Palace - Prize': { roomId: 0x06, mask: 0x800 },
  "Thieves' Town - Prize": { roomId: 0xac, mask: 0x800 },
  'Skull Woods - Prize': { roomId: 0x29, mask: 0x800 },
  'Ice Palace - Prize': { roomId: 0xde, mask: 0x800 },
  'Misery Mire - Prize': { roomId: 0x90, mask: 0x800 },
  'Turtle Rock - Prize': { roomId: 0xa4, mask: 0x800 },

  // ═══════════════════════════════════════════
  // Key Drops (bit 10 = 0x400)
  // ═══════════════════════════════════════════
  'Hyrule Castle - Map Guard Key Drop': { roomId: 0x72, mask: 0x400 },
  'Hyrule Castle - Boomerang Guard Key Drop': { roomId: 0x71, mask: 0x400 },
  'Sewers - Key Rat Key Drop': { roomId: 0x21, mask: 0x400 },
  'Hyrule Castle - Big Key Drop': { roomId: 0x80, mask: 0x400 },
  'Castle Tower - Dark Archer Key Drop': { roomId: 0xc0, mask: 0x400 },
  'Castle Tower - Circle of Pots Key Drop': { roomId: 0xb0, mask: 0x400 },
  'Eastern Palace - Dark Square Pot Key': { roomId: 0xba, mask: 0x400 },
  'Eastern Palace - Dark Eyegore Key Drop': { roomId: 0x99, mask: 0x400 },
  'Desert Palace - Desert Tiles 1 Pot Key': { roomId: 0x63, mask: 0x400 },
  'Desert Palace - Beamos Hall Pot Key': { roomId: 0x53, mask: 0x400 },
  'Desert Palace - Desert Tiles 2 Pot Key': { roomId: 0x43, mask: 0x400 },
  'Swamp Palace - Pot Row Pot Key': { roomId: 0x38, mask: 0x400 },
  'Swamp Palace - Trench 1 Pot Key': { roomId: 0x37, mask: 0x400 },
  'Swamp Palace - Hookshot Pot Key': { roomId: 0x36, mask: 0x400 },
  'Swamp Palace - Trench 2 Pot Key': { roomId: 0x35, mask: 0x400 },
  'Swamp Palace - Waterway Pot Key': { roomId: 0x16, mask: 0x400 },
  "Thieves' Town - Hallway Pot Key": { roomId: 0xbc, mask: 0x400 },
  "Thieves' Town - Spike Switch Pot Key": { roomId: 0xab, mask: 0x400 },
  'Skull Woods - West Lobby Pot Key': { roomId: 0x56, mask: 0x400 },
  'Skull Woods - Spike Corner Key Drop': { roomId: 0x39, mask: 0x400 },
  'Ice Palace - Jelly Key Drop': { roomId: 0x0e, mask: 0x400 },
  'Ice Palace - Conveyor Key Drop': { roomId: 0x3e, mask: 0x400 },
  'Ice Palace - Hammer Block Key Drop': { roomId: 0x3f, mask: 0x400 },
  'Ice Palace - Many Pots Pot Key': { roomId: 0x9f, mask: 0x400 },
  'Misery Mire - Spikes Pot Key': { roomId: 0xb3, mask: 0x400 },
  'Misery Mire - Fishbone Pot Key': { roomId: 0xa1, mask: 0x400 },
  'Misery Mire - Conveyor Crystal Key Drop': { roomId: 0xc1, mask: 0x400 },
  'Turtle Rock - Pokey 1 Key Drop': { roomId: 0xb6, mask: 0x400 },
  'Turtle Rock - Pokey 2 Key Drop': { roomId: 0x13, mask: 0x400 },
  'Ganons Tower - Conveyor Cross Pot Key': { roomId: 0x8b, mask: 0x400 },
  'Ganons Tower - Double Switch Pot Key': { roomId: 0x9b, mask: 0x400 },
  'Ganons Tower - Conveyor Star Pits Pot Key': { roomId: 0x7b, mask: 0x400 },
  'Ganons Tower - Mini Helmasaur Key Drop': { roomId: 0x3d, mask: 0x400 },
};

export { CHECK_ROOM_FLAGS, CHEST_OPEN_MASKS, DIRECT_ROOM_FLAGS };
export type { DirectRoomFlagEntry, RoomFlagEntry };
