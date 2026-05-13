import type { CheckDefinition } from '../../types/tracker';

export const OVERWORLD_CHECKS: CheckDefinition[] = [
  // ─── Light World ───

  { id: 'Mushroom', name: 'Mushroom', type: 'standing', region: 'Light World', vanillaItem: 'Mushroom' },
  { id: 'Bottle Merchant', name: 'Bottle Merchant', type: 'npc', region: 'Light World', vanillaItem: 'Bottle' },
  { id: 'Flute Spot', name: 'Flute Spot', type: 'dig', region: 'Light World', vanillaItem: 'Flute' },
  { id: 'Sunken Treasure', name: 'Sunken Treasure', type: 'event', region: 'Light World', vanillaItem: 'Heart Piece' },
  { id: 'Purple Chest', name: 'Purple Chest', type: 'npc', region: 'Light World', vanillaItem: 'Bottle' },
  { id: 'Flute Activation Spot', name: 'Flute Activation Spot', type: 'event', region: 'Light World' },

  // Blind's Hideout
  { id: "Blind's Hideout - Top", name: "Blind's Hideout - Top", type: 'chest', region: 'Blinds Hideout', vanillaItem: 'Heart Piece' },
  { id: "Blind's Hideout - Left", name: "Blind's Hideout - Left", type: 'chest', region: 'Blinds Hideout', vanillaItem: '20 Rupees' },
  { id: "Blind's Hideout - Right", name: "Blind's Hideout - Right", type: 'chest', region: 'Blinds Hideout', vanillaItem: '20 Rupees' },
  { id: "Blind's Hideout - Far Left", name: "Blind's Hideout - Far Left", type: 'chest', region: 'Blinds Hideout', vanillaItem: '20 Rupees' },
  { id: "Blind's Hideout - Far Right", name: "Blind's Hideout - Far Right", type: 'chest', region: 'Blinds Hideout', vanillaItem: '20 Rupees' },

  // Hyrule Castle Secret Entrance
  { id: "Link's Uncle", name: "Link's Uncle", type: 'npc', region: 'Hyrule Castle Secret Entrance', vanillaItem: 'Fighter Sword' },
  { id: 'Secret Passage', name: 'Secret Passage', type: 'chest', region: 'Hyrule Castle Secret Entrance', vanillaItem: '5 Rupees' },

  // Zora's River
  { id: 'King Zora', name: 'King Zora', type: 'npc', region: 'Zoras River', vanillaItem: 'Flippers' },
  { id: "Zora's Ledge", name: "Zora's Ledge", type: 'standing', region: 'Zoras River', vanillaItem: 'Heart Piece' },

  // Waterfall of Wishing
  { id: 'Waterfall Fairy - Left', name: 'Waterfall Fairy - Left', type: 'chest', region: 'Waterfall of Wishing', vanillaItem: 'Red Boomerang' },
  { id: 'Waterfall Fairy - Right', name: 'Waterfall Fairy - Right', type: 'chest', region: 'Waterfall of Wishing', vanillaItem: 'Fire Shield' },

  // King's Tomb
  { id: "King's Tomb", name: "King's Tomb", type: 'chest', region: 'Kings Grave', vanillaItem: 'Cape' },

  // Dam
  { id: 'Floodgate Chest', name: 'Floodgate Chest', type: 'chest', region: 'Dam', vanillaItem: '20 Rupees' },
  { id: 'Floodgate', name: 'Floodgate', type: 'event', region: 'Dam' },

  // Link's House
  { id: "Link's House", name: "Link's House", type: 'chest', region: 'Links House', vanillaItem: 'Lamp' },

  // Tavern / Chicken House / Aginah's Cave
  { id: 'Kakariko Tavern', name: 'Kakariko Tavern', type: 'chest', region: 'Tavern', vanillaItem: 'Bottle' },
  { id: 'Chicken House', name: 'Chicken House', type: 'chest', region: 'Chicken House', vanillaItem: '10 Bombs' },
  { id: "Aginah's Cave", name: "Aginah's Cave", type: 'chest', region: 'Aginahs Cave', vanillaItem: 'Heart Piece' },

  // Sahasrahla's Hut
  { id: "Sahasrahla's Hut - Left", name: "Sahasrahla's Hut - Left", type: 'chest', region: 'Sahasrahlas Hut', vanillaItem: '50 Rupees' },
  { id: "Sahasrahla's Hut - Middle", name: "Sahasrahla's Hut - Middle", type: 'chest', region: 'Sahasrahlas Hut', vanillaItem: '3 Bombs' },
  { id: "Sahasrahla's Hut - Right", name: "Sahasrahla's Hut - Right", type: 'chest', region: 'Sahasrahlas Hut', vanillaItem: '50 Rupees' },
  { id: 'Sahasrahla', name: 'Sahasrahla', type: 'npc', region: 'Sahasrahlas Hut', vanillaItem: 'Pegasus Boots' },

  // Kakariko Well
  { id: 'Kakariko Well - Top', name: 'Kakariko Well - Top', type: 'chest', region: 'Kakariko Well (top)', vanillaItem: 'Heart Piece' },
  { id: 'Kakariko Well - Left', name: 'Kakariko Well - Left', type: 'chest', region: 'Kakariko Well (top)', vanillaItem: '20 Rupees' },
  { id: 'Kakariko Well - Middle', name: 'Kakariko Well - Middle', type: 'chest', region: 'Kakariko Well (top)', vanillaItem: '20 Rupees' },
  { id: 'Kakariko Well - Right', name: 'Kakariko Well - Right', type: 'chest', region: 'Kakariko Well (top)', vanillaItem: '20 Rupees' },
  { id: 'Kakariko Well - Bottom', name: 'Kakariko Well - Bottom', type: 'chest', region: 'Kakariko Well (top)', vanillaItem: '3 Bombs' },

  // NPCs
  { id: 'Blacksmith', name: 'Blacksmith', type: 'npc', region: 'Blacksmiths Hut', vanillaItem: 'Tempered Sword' },
  { id: 'Magic Bat', name: 'Magic Bat', type: 'npc', region: 'Bat Cave (right)', vanillaItem: 'Magic Upgrade (1/2)' },
  { id: 'Sick Kid', name: 'Sick Kid', type: 'npc', region: 'Sick Kids House', vanillaItem: 'Bug Catching Net' },
  { id: 'Hobo', name: 'Hobo', type: 'npc', region: 'Hobo Bridge', vanillaItem: 'Bottle' },

  // Misc Light World
  { id: 'Lost Woods Hideout', name: 'Lost Woods Hideout', type: 'standing', region: 'Lost Woods Hideout (top)', vanillaItem: 'Heart Piece' },
  { id: 'Lumberjack Tree', name: 'Lumberjack Tree', type: 'standing', region: 'Lumberjack Tree (top)', vanillaItem: 'Heart Piece' },
  { id: 'Cave 45', name: 'Cave 45', type: 'standing', region: 'Cave 45', vanillaItem: 'Heart Piece' },
  { id: 'Graveyard Cave', name: 'Graveyard Cave', type: 'chest', region: 'Graveyard Cave', vanillaItem: 'Heart Piece' },
  { id: 'Checkerboard Cave', name: 'Checkerboard Cave', type: 'chest', region: 'Checkerboard Cave', vanillaItem: 'Heart Piece' },

  // Mini Moldorm Cave
  { id: 'Mini Moldorm Cave - Far Left', name: 'Mini Moldorm Cave - Far Left', type: 'chest', region: 'Mini Moldorm Cave', vanillaItem: '50 Rupees' },
  { id: 'Mini Moldorm Cave - Left', name: 'Mini Moldorm Cave - Left', type: 'chest', region: 'Mini Moldorm Cave', vanillaItem: '20 Rupees' },
  { id: 'Mini Moldorm Cave - Right', name: 'Mini Moldorm Cave - Right', type: 'chest', region: 'Mini Moldorm Cave', vanillaItem: '10 Bombs' },
  { id: 'Mini Moldorm Cave - Far Right', name: 'Mini Moldorm Cave - Far Right', type: 'chest', region: 'Mini Moldorm Cave', vanillaItem: '50 Rupees' },
  { id: 'Mini Moldorm Cave - Generous Guy', name: 'Mini Moldorm Cave - Generous Guy', type: 'npc', region: 'Mini Moldorm Cave', vanillaItem: '300 Rupees' },

  // More Light World
  { id: 'Ice Rod Cave', name: 'Ice Rod Cave', type: 'chest', region: 'Ice Rod Cave', vanillaItem: 'Ice Rod' },
  { id: 'Bonk Rock Cave', name: 'Bonk Rock Cave', type: 'chest', region: 'Bonk Rock Cave', vanillaItem: 'Heart Piece' },
  { id: 'Library', name: 'Library', type: 'standing', region: 'Library', vanillaItem: 'Book of Mudora' },
  { id: 'Potion Shop', name: 'Potion Shop', type: 'npc', region: 'Potion Shop', vanillaItem: 'Magic Powder' },
  { id: 'Lake Hylia Island', name: 'Lake Hylia Island', type: 'standing', region: 'Lake Hylia Island', vanillaItem: 'Heart Piece' },
  { id: 'Maze Race', name: 'Maze Race', type: 'standing', region: 'Maze Race Ledge', vanillaItem: 'Heart Piece' },
  { id: 'Desert Ledge', name: 'Desert Ledge', type: 'standing', region: 'Desert Ledge', vanillaItem: 'Heart Piece' },

  // Death Mountain Area
  { id: 'Old Man', name: 'Old Man', type: 'npc', region: 'Old Man Cave', vanillaItem: 'Magic Mirror' },
  { id: 'Spectacle Rock Cave', name: 'Spectacle Rock Cave', type: 'chest', region: 'Spectacle Rock Cave (Top)', vanillaItem: 'Heart Piece' },

  // Paradox Cave
  { id: 'Paradox Cave Lower - Far Left', name: 'Paradox Cave Lower - Far Left', type: 'chest', region: 'Paradox Cave Chest Area', vanillaItem: '20 Rupees' },
  { id: 'Paradox Cave Lower - Left', name: 'Paradox Cave Lower - Left', type: 'chest', region: 'Paradox Cave Chest Area', vanillaItem: '20 Rupees' },
  { id: 'Paradox Cave Lower - Right', name: 'Paradox Cave Lower - Right', type: 'chest', region: 'Paradox Cave Chest Area', vanillaItem: '20 Rupees' },
  { id: 'Paradox Cave Lower - Far Right', name: 'Paradox Cave Lower - Far Right', type: 'chest', region: 'Paradox Cave Chest Area', vanillaItem: '20 Rupees' },
  { id: 'Paradox Cave Lower - Middle', name: 'Paradox Cave Lower - Middle', type: 'chest', region: 'Paradox Cave Chest Area', vanillaItem: '20 Rupees' },
  { id: 'Paradox Cave Upper - Left', name: 'Paradox Cave Upper - Left', type: 'chest', region: 'Paradox Cave Chest Area', vanillaItem: '10 Arrows' },
  { id: 'Paradox Cave Upper - Right', name: 'Paradox Cave Upper - Right', type: 'chest', region: 'Paradox Cave Chest Area', vanillaItem: '10 Arrows' },

  // Spiral Cave / Death Mountain Top
  { id: 'Spiral Cave', name: 'Spiral Cave', type: 'chest', region: 'Spiral Cave (Top)', vanillaItem: '50 Rupees' },
  { id: 'Ether Tablet', name: 'Ether Tablet', type: 'standing', region: 'Death Mountain (Top)', vanillaItem: 'Ether' },
  { id: 'Spectacle Rock', name: 'Spectacle Rock', type: 'standing', region: 'Spectacle Rock', vanillaItem: 'Heart Piece' },
  { id: 'Master Sword Pedestal', name: 'Master Sword Pedestal', type: 'standing', region: 'Master Sword Meadow', vanillaItem: 'Progressive Sword' },
  { id: 'Floating Island', name: 'Floating Island', type: 'standing', region: 'Death Mountain Floating Island (Light World)', vanillaItem: 'Heart Piece' },
  { id: 'Mimic Cave', name: 'Mimic Cave', type: 'chest', region: 'Mimic Cave', vanillaItem: 'Heart Piece' },
  { id: 'Spike Cave', name: 'Spike Cave', type: 'chest', region: 'Spike Cave', vanillaItem: 'Cane of Byrna' },

  // ─── Dark World ───

  { id: 'Pyramid', name: 'Pyramid', type: 'standing', region: 'East Dark World', vanillaItem: 'Heart Piece' },
  { id: 'Catfish', name: 'Catfish', type: 'npc', region: 'Catfish', vanillaItem: 'Quake' },
  { id: 'Stumpy', name: 'Stumpy', type: 'npc', region: 'South Dark World', vanillaItem: 'Shovel' },
  { id: 'Digging Game', name: 'Digging Game', type: 'dig', region: 'South Dark World', vanillaItem: 'Heart Piece' },
  { id: 'Bombos Tablet', name: 'Bombos Tablet', type: 'standing', region: 'Bombos Tablet Ledge', vanillaItem: 'Bombos' },
  { id: 'Frog', name: 'Frog', type: 'npc', region: 'West Dark World' },
  { id: 'Missing Smith', name: 'Missing Smith', type: 'npc', region: 'Blacksmiths Hut' },
  { id: 'Dark Blacksmith Ruins', name: 'Dark Blacksmith Ruins', type: 'standing', region: 'Hammer Peg Area', vanillaItem: '20 Rupees' },

  // Hype Cave
  { id: 'Hype Cave - Top', name: 'Hype Cave - Top', type: 'chest', region: 'Hype Cave', vanillaItem: '50 Rupees' },
  { id: 'Hype Cave - Middle Right', name: 'Hype Cave - Middle Right', type: 'chest', region: 'Hype Cave', vanillaItem: '20 Rupees' },
  { id: 'Hype Cave - Middle Left', name: 'Hype Cave - Middle Left', type: 'chest', region: 'Hype Cave', vanillaItem: '20 Rupees' },
  { id: 'Hype Cave - Bottom', name: 'Hype Cave - Bottom', type: 'chest', region: 'Hype Cave', vanillaItem: '20 Rupees' },
  { id: 'Hype Cave - Generous Guy', name: 'Hype Cave - Generous Guy', type: 'npc', region: 'Hype Cave', vanillaItem: '300 Rupees' },

  // More Dark World
  { id: 'Peg Cave', name: 'Peg Cave', type: 'standing', region: 'Dark World Hammer Peg Cave', vanillaItem: 'Heart Piece' },
  { id: 'Pyramid Fairy - Left', name: 'Pyramid Fairy - Left', type: 'chest', region: 'Pyramid Fairy', vanillaItem: 'Progressive Sword' },
  { id: 'Pyramid Fairy - Right', name: 'Pyramid Fairy - Right', type: 'chest', region: 'Pyramid Fairy', vanillaItem: 'Silver Bow' },
  { id: 'Brewery', name: 'Brewery', type: 'chest', region: 'Brewery', vanillaItem: 'Heart Piece' },
  { id: 'C-Shaped House', name: 'C-Shaped House', type: 'chest', region: 'C-Shaped House', vanillaItem: '300 Rupees' },
  { id: 'Chest Game', name: 'Chest Game', type: 'chest', region: 'Chest Game', vanillaItem: 'Heart Piece' },
  { id: 'Bumper Cave Ledge', name: 'Bumper Cave Ledge', type: 'standing', region: 'Bumper Cave Ledge', vanillaItem: 'Heart Piece' },

  // Mire Shed
  { id: 'Mire Shed - Left', name: 'Mire Shed - Left', type: 'chest', region: 'Mire Shed', vanillaItem: 'Heart Piece' },
  { id: 'Mire Shed - Right', name: 'Mire Shed - Right', type: 'chest', region: 'Mire Shed', vanillaItem: '20 Rupees' },

  // Superbunny Cave
  { id: 'Superbunny Cave - Top', name: 'Superbunny Cave - Top', type: 'chest', region: 'Superbunny Cave (Top)', vanillaItem: '20 Rupees' },
  { id: 'Superbunny Cave - Bottom', name: 'Superbunny Cave - Bottom', type: 'chest', region: 'Superbunny Cave (Top)', vanillaItem: '20 Rupees' },

  // Hookshot Cave
  { id: 'Hookshot Cave - Top Right', name: 'Hookshot Cave - Top Right', type: 'chest', region: 'Hookshot Cave', vanillaItem: '50 Rupees' },
  { id: 'Hookshot Cave - Top Left', name: 'Hookshot Cave - Top Left', type: 'chest', region: 'Hookshot Cave', vanillaItem: '50 Rupees' },
  { id: 'Hookshot Cave - Bottom Right', name: 'Hookshot Cave - Bottom Right', type: 'chest', region: 'Hookshot Cave', vanillaItem: '50 Rupees' },
  { id: 'Hookshot Cave - Bottom Left', name: 'Hookshot Cave - Bottom Left', type: 'chest', region: 'Hookshot Cave', vanillaItem: '50 Rupees' },

  // ─── Event / Boss Checks ───

  { id: 'Ganon', name: 'Ganon', type: 'boss', region: 'Pyramid' },
  { id: 'Agahnim 1', name: 'Agahnim 1', type: 'boss', region: 'Agahnim 1', dungeon: 'Castle Tower' },
  { id: 'Agahnim 2', name: 'Agahnim 2', type: 'boss', region: 'Agahnim 2', dungeon: "Ganon's Tower" },
];
