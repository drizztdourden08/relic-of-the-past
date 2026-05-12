import type { CheckDefinition } from '../../types/tracker';

export const OVERWORLD_CHECKS: CheckDefinition[] = [
  // ─── Light World ───

  { id: 'Mushroom', name: 'Mushroom', type: 'standing', region: 'Light World', vanillaItem: 'Mushroom' },
  { id: 'Bottle Merchant', name: 'Bottle Merchant', type: 'npc', region: 'Light World', vanillaItem: 'Bottle' },
  { id: 'Flute Spot', name: 'Flute Spot', type: 'dig', region: 'Light World', vanillaItem: 'Flute' },
  { id: 'Sunken Treasure', name: 'Sunken Treasure', type: 'event', region: 'Light World' },
  { id: 'Purple Chest', name: 'Purple Chest', type: 'npc', region: 'Light World' },
  { id: 'Flute Activation Spot', name: 'Flute Activation Spot', type: 'event', region: 'Light World' },

  // Blind's Hideout
  { id: "Blind's Hideout - Top", name: "Blind's Hideout - Top", type: 'chest', region: 'Blinds Hideout' },
  { id: "Blind's Hideout - Left", name: "Blind's Hideout - Left", type: 'chest', region: 'Blinds Hideout' },
  { id: "Blind's Hideout - Right", name: "Blind's Hideout - Right", type: 'chest', region: 'Blinds Hideout' },
  { id: "Blind's Hideout - Far Left", name: "Blind's Hideout - Far Left", type: 'chest', region: 'Blinds Hideout' },
  { id: "Blind's Hideout - Far Right", name: "Blind's Hideout - Far Right", type: 'chest', region: 'Blinds Hideout' },

  // Hyrule Castle Secret Entrance
  { id: "Link's Uncle", name: "Link's Uncle", type: 'npc', region: 'Hyrule Castle Secret Entrance', vanillaItem: 'Fighter Sword' },
  { id: 'Secret Passage', name: 'Secret Passage', type: 'chest', region: 'Hyrule Castle Secret Entrance' },

  // Zora's River
  { id: 'King Zora', name: 'King Zora', type: 'npc', region: 'Zoras River', vanillaItem: 'Flippers' },
  { id: "Zora's Ledge", name: "Zora's Ledge", type: 'standing', region: 'Zoras River' },

  // Waterfall of Wishing
  { id: 'Waterfall Fairy - Left', name: 'Waterfall Fairy - Left', type: 'chest', region: 'Waterfall of Wishing' },
  { id: 'Waterfall Fairy - Right', name: 'Waterfall Fairy - Right', type: 'chest', region: 'Waterfall of Wishing' },

  // King's Tomb
  { id: "King's Tomb", name: "King's Tomb", type: 'chest', region: 'Kings Grave' },

  // Dam
  { id: 'Floodgate Chest', name: 'Floodgate Chest', type: 'chest', region: 'Dam' },
  { id: 'Floodgate', name: 'Floodgate', type: 'event', region: 'Dam' },

  // Link's House
  { id: "Link's House", name: "Link's House", type: 'chest', region: 'Links House', vanillaItem: 'Lamp' },

  // Tavern / Chicken House / Aginah's Cave
  { id: 'Kakariko Tavern', name: 'Kakariko Tavern', type: 'chest', region: 'Tavern' },
  { id: 'Chicken House', name: 'Chicken House', type: 'chest', region: 'Chicken House' },
  { id: "Aginah's Cave", name: "Aginah's Cave", type: 'chest', region: 'Aginahs Cave' },

  // Sahasrahla's Hut
  { id: "Sahasrahla's Hut - Left", name: "Sahasrahla's Hut - Left", type: 'chest', region: 'Sahasrahlas Hut' },
  { id: "Sahasrahla's Hut - Middle", name: "Sahasrahla's Hut - Middle", type: 'chest', region: 'Sahasrahlas Hut' },
  { id: "Sahasrahla's Hut - Right", name: "Sahasrahla's Hut - Right", type: 'chest', region: 'Sahasrahlas Hut' },
  { id: 'Sahasrahla', name: 'Sahasrahla', type: 'npc', region: 'Sahasrahlas Hut', vanillaItem: 'Progressive Glove' },

  // Kakariko Well
  { id: 'Kakariko Well - Top', name: 'Kakariko Well - Top', type: 'chest', region: 'Kakariko Well (top)' },
  { id: 'Kakariko Well - Left', name: 'Kakariko Well - Left', type: 'chest', region: 'Kakariko Well (top)' },
  { id: 'Kakariko Well - Middle', name: 'Kakariko Well - Middle', type: 'chest', region: 'Kakariko Well (top)' },
  { id: 'Kakariko Well - Right', name: 'Kakariko Well - Right', type: 'chest', region: 'Kakariko Well (top)' },
  { id: 'Kakariko Well - Bottom', name: 'Kakariko Well - Bottom', type: 'chest', region: 'Kakariko Well (top)' },

  // NPCs
  { id: 'Blacksmith', name: 'Blacksmith', type: 'npc', region: 'Blacksmiths Hut' },
  { id: 'Magic Bat', name: 'Magic Bat', type: 'npc', region: 'Bat Cave (right)', vanillaItem: 'Magic Upgrade (1/2)' },
  { id: 'Sick Kid', name: 'Sick Kid', type: 'npc', region: 'Sick Kids House' },
  { id: 'Hobo', name: 'Hobo', type: 'npc', region: 'Hobo Bridge' },

  // Misc Light World
  { id: 'Lost Woods Hideout', name: 'Lost Woods Hideout', type: 'standing', region: 'Lost Woods Hideout (top)' },
  { id: 'Lumberjack Tree', name: 'Lumberjack Tree', type: 'standing', region: 'Lumberjack Tree (top)' },
  { id: 'Cave 45', name: 'Cave 45', type: 'standing', region: 'Cave 45' },
  { id: 'Graveyard Cave', name: 'Graveyard Cave', type: 'chest', region: 'Graveyard Cave' },
  { id: 'Checkerboard Cave', name: 'Checkerboard Cave', type: 'chest', region: 'Checkerboard Cave' },

  // Mini Moldorm Cave
  { id: 'Mini Moldorm Cave - Far Left', name: 'Mini Moldorm Cave - Far Left', type: 'chest', region: 'Mini Moldorm Cave' },
  { id: 'Mini Moldorm Cave - Left', name: 'Mini Moldorm Cave - Left', type: 'chest', region: 'Mini Moldorm Cave' },
  { id: 'Mini Moldorm Cave - Right', name: 'Mini Moldorm Cave - Right', type: 'chest', region: 'Mini Moldorm Cave' },
  { id: 'Mini Moldorm Cave - Far Right', name: 'Mini Moldorm Cave - Far Right', type: 'chest', region: 'Mini Moldorm Cave' },
  { id: 'Mini Moldorm Cave - Generous Guy', name: 'Mini Moldorm Cave - Generous Guy', type: 'npc', region: 'Mini Moldorm Cave' },

  // More Light World
  { id: 'Ice Rod Cave', name: 'Ice Rod Cave', type: 'chest', region: 'Ice Rod Cave' },
  { id: 'Bonk Rock Cave', name: 'Bonk Rock Cave', type: 'chest', region: 'Bonk Rock Cave' },
  { id: 'Library', name: 'Library', type: 'standing', region: 'Library' },
  { id: 'Potion Shop', name: 'Potion Shop', type: 'npc', region: 'Potion Shop', vanillaItem: 'Magic Powder' },
  { id: 'Lake Hylia Island', name: 'Lake Hylia Island', type: 'standing', region: 'Lake Hylia Island' },
  { id: 'Maze Race', name: 'Maze Race', type: 'standing', region: 'Maze Race Ledge' },
  { id: 'Desert Ledge', name: 'Desert Ledge', type: 'standing', region: 'Desert Ledge' },

  // Death Mountain Area
  { id: 'Old Man', name: 'Old Man', type: 'npc', region: 'Old Man Cave' },
  { id: 'Spectacle Rock Cave', name: 'Spectacle Rock Cave', type: 'chest', region: 'Spectacle Rock Cave (Top)' },

  // Paradox Cave
  { id: 'Paradox Cave Lower - Far Left', name: 'Paradox Cave Lower - Far Left', type: 'chest', region: 'Paradox Cave Chest Area' },
  { id: 'Paradox Cave Lower - Left', name: 'Paradox Cave Lower - Left', type: 'chest', region: 'Paradox Cave Chest Area' },
  { id: 'Paradox Cave Lower - Right', name: 'Paradox Cave Lower - Right', type: 'chest', region: 'Paradox Cave Chest Area' },
  { id: 'Paradox Cave Lower - Far Right', name: 'Paradox Cave Lower - Far Right', type: 'chest', region: 'Paradox Cave Chest Area' },
  { id: 'Paradox Cave Lower - Middle', name: 'Paradox Cave Lower - Middle', type: 'chest', region: 'Paradox Cave Chest Area' },
  { id: 'Paradox Cave Upper - Left', name: 'Paradox Cave Upper - Left', type: 'chest', region: 'Paradox Cave Chest Area' },
  { id: 'Paradox Cave Upper - Right', name: 'Paradox Cave Upper - Right', type: 'chest', region: 'Paradox Cave Chest Area' },

  // Spiral Cave / Death Mountain Top
  { id: 'Spiral Cave', name: 'Spiral Cave', type: 'chest', region: 'Spiral Cave (Top)' },
  { id: 'Ether Tablet', name: 'Ether Tablet', type: 'standing', region: 'Death Mountain (Top)', vanillaItem: 'Ether' },
  { id: 'Spectacle Rock', name: 'Spectacle Rock', type: 'standing', region: 'Spectacle Rock' },
  { id: 'Master Sword Pedestal', name: 'Master Sword Pedestal', type: 'standing', region: 'Master Sword Meadow', vanillaItem: 'Progressive Sword' },
  { id: 'Floating Island', name: 'Floating Island', type: 'standing', region: 'Death Mountain Floating Island (Light World)' },
  { id: 'Mimic Cave', name: 'Mimic Cave', type: 'chest', region: 'Mimic Cave' },
  { id: 'Spike Cave', name: 'Spike Cave', type: 'chest', region: 'Spike Cave' },

  // ─── Dark World ───

  { id: 'Pyramid', name: 'Pyramid', type: 'standing', region: 'East Dark World' },
  { id: 'Catfish', name: 'Catfish', type: 'npc', region: 'Catfish' },
  { id: 'Stumpy', name: 'Stumpy', type: 'npc', region: 'South Dark World' },
  { id: 'Digging Game', name: 'Digging Game', type: 'dig', region: 'South Dark World' },
  { id: 'Bombos Tablet', name: 'Bombos Tablet', type: 'standing', region: 'Bombos Tablet Ledge', vanillaItem: 'Bombos' },
  { id: 'Frog', name: 'Frog', type: 'npc', region: 'West Dark World' },
  { id: 'Missing Smith', name: 'Missing Smith', type: 'npc', region: 'Blacksmiths Hut' },
  { id: 'Dark Blacksmith Ruins', name: 'Dark Blacksmith Ruins', type: 'standing', region: 'Hammer Peg Area' },

  // Hype Cave
  { id: 'Hype Cave - Top', name: 'Hype Cave - Top', type: 'chest', region: 'Hype Cave' },
  { id: 'Hype Cave - Middle Right', name: 'Hype Cave - Middle Right', type: 'chest', region: 'Hype Cave' },
  { id: 'Hype Cave - Middle Left', name: 'Hype Cave - Middle Left', type: 'chest', region: 'Hype Cave' },
  { id: 'Hype Cave - Bottom', name: 'Hype Cave - Bottom', type: 'chest', region: 'Hype Cave' },
  { id: 'Hype Cave - Generous Guy', name: 'Hype Cave - Generous Guy', type: 'npc', region: 'Hype Cave' },

  // More Dark World
  { id: 'Peg Cave', name: 'Peg Cave', type: 'standing', region: 'Dark World Hammer Peg Cave' },
  { id: 'Pyramid Fairy - Left', name: 'Pyramid Fairy - Left', type: 'chest', region: 'Pyramid Fairy' },
  { id: 'Pyramid Fairy - Right', name: 'Pyramid Fairy - Right', type: 'chest', region: 'Pyramid Fairy' },
  { id: 'Brewery', name: 'Brewery', type: 'chest', region: 'Brewery' },
  { id: 'C-Shaped House', name: 'C-Shaped House', type: 'chest', region: 'C-Shaped House' },
  { id: 'Chest Game', name: 'Chest Game', type: 'chest', region: 'Chest Game' },
  { id: 'Bumper Cave Ledge', name: 'Bumper Cave Ledge', type: 'standing', region: 'Bumper Cave Ledge' },

  // Mire Shed
  { id: 'Mire Shed - Left', name: 'Mire Shed - Left', type: 'chest', region: 'Mire Shed' },
  { id: 'Mire Shed - Right', name: 'Mire Shed - Right', type: 'chest', region: 'Mire Shed' },

  // Superbunny Cave
  { id: 'Superbunny Cave - Top', name: 'Superbunny Cave - Top', type: 'chest', region: 'Superbunny Cave (Top)' },
  { id: 'Superbunny Cave - Bottom', name: 'Superbunny Cave - Bottom', type: 'chest', region: 'Superbunny Cave (Top)' },

  // Hookshot Cave
  { id: 'Hookshot Cave - Top Right', name: 'Hookshot Cave - Top Right', type: 'chest', region: 'Hookshot Cave' },
  { id: 'Hookshot Cave - Top Left', name: 'Hookshot Cave - Top Left', type: 'chest', region: 'Hookshot Cave' },
  { id: 'Hookshot Cave - Bottom Right', name: 'Hookshot Cave - Bottom Right', type: 'chest', region: 'Hookshot Cave' },
  { id: 'Hookshot Cave - Bottom Left', name: 'Hookshot Cave - Bottom Left', type: 'chest', region: 'Hookshot Cave' },

  // ─── Event / Boss Checks ───

  { id: 'Ganon', name: 'Ganon', type: 'boss', region: 'Pyramid' },
  { id: 'Agahnim 1', name: 'Agahnim 1', type: 'boss', region: 'Agahnim 1', dungeon: 'Castle Tower' },
  { id: 'Agahnim 2', name: 'Agahnim 2', type: 'boss', region: 'Agahnim 2', dungeon: "Ganon's Tower" },
];
