/* @layer shared-game @kind data */
﻿import type { CheckDefinition } from '../types';

const LIGHT_WORLD_CHECKS: CheckDefinition[] = [
  // ─── Progression Events (milestones, no item reward) ───

  { id: 'event-link-wakes-up', name: 'Link Wakes Up', type: 'event', screen: 'menu' },
  { id: 'event-zelda-rescue', name: 'Zelda Rescue Started', type: 'event', screen: 'hyrule-castle' },
  { id: 'event-rescued-zelda', name: 'Rescued Zelda', type: 'event', screen: 'sanctuary' },

  // ─── Light World ───

  { id: 'Mushroom', name: 'Mushroom', type: 'standing', screen: 'light-world', vanillaItem: 'Mushroom' },
  { id: 'Bottle Merchant', name: 'Bottle Merchant', type: 'npc', screen: 'light-world', vanillaItem: 'Bottle' },
  { id: 'Flute Spot', name: 'Flute Spot', type: 'dig', screen: 'light-world', vanillaItem: 'Flute' },
  { id: 'Sunken Treasure', name: 'Sunken Treasure', type: 'event', screen: 'light-world', vanillaItem: 'Heart Piece' },
  { id: 'Purple Chest', name: 'Purple Chest', type: 'npc', screen: 'light-world', vanillaItem: 'Bottle' },
  { id: 'Flute Activation Spot', name: 'Flute Activation Spot', type: 'event', screen: 'light-world' },

  // Blind's Hideout
  { id: "Blind's Hideout - Top", name: "Blind's Hideout - Top", type: 'chest', screen: 'blinds-hideout', vanillaItem: 'Heart Piece' },
  { id: "Blind's Hideout - Left", name: "Blind's Hideout - Left", type: 'chest', screen: 'blinds-hideout', vanillaItem: '20 Rupees' },
  { id: "Blind's Hideout - Right", name: "Blind's Hideout - Right", type: 'chest', screen: 'blinds-hideout', vanillaItem: '20 Rupees' },
  { id: "Blind's Hideout - Far Left", name: "Blind's Hideout - Far Left", type: 'chest', screen: 'blinds-hideout', vanillaItem: '20 Rupees' },
  { id: "Blind's Hideout - Far Right", name: "Blind's Hideout - Far Right", type: 'chest', screen: 'blinds-hideout', vanillaItem: '20 Rupees' },

  // Hyrule Castle Secret Entrance
  { id: "Link's Uncle", name: "Link's Uncle", type: 'npc', screen: 'hyrule-castle-secret-entrance', vanillaItem: ['Fighter Sword', 'Fighters Shield'] },
  { id: 'Secret Passage', name: 'Secret Passage', type: 'chest', screen: 'hyrule-castle', vanillaItem: '5 Rupees' },

  // Zora's River
  { id: 'King Zora', name: 'King Zora', type: 'npc', screen: 'zoras-river', vanillaItem: 'Flippers' },
  { id: "Zora's Ledge", name: "Zora's Ledge", type: 'standing', screen: 'zoras-river', vanillaItem: 'Heart Piece' },

  // Waterfall of Wishing
  { id: 'Waterfall Fairy - Left', name: 'Waterfall Fairy - Left', type: 'chest', screen: 'waterfall-of-wishing', vanillaItem: 'Red Boomerang' },
  { id: 'Waterfall Fairy - Right', name: 'Waterfall Fairy - Right', type: 'chest', screen: 'waterfall-of-wishing', vanillaItem: 'Fire Shield' },

  // King's Tomb
  { id: "King's Tomb", name: "King's Tomb", type: 'chest', screen: 'kings-grave', vanillaItem: 'Cape' },

  // Dam
  { id: 'Floodgate Chest', name: 'Floodgate Chest', type: 'chest', screen: 'dam', vanillaItem: '20 Rupees' },
  { id: 'Floodgate', name: 'Floodgate', type: 'event', screen: 'dam' },

  // Link's House
  { id: "Link's House", name: "Link's House", type: 'chest', screen: 'links-house', vanillaItem: 'Lamp' },

  // Tavern / Chicken House / Aginah's Cave
  { id: 'Kakariko Tavern', name: 'Kakariko Tavern', type: 'chest', screen: 'tavern', vanillaItem: 'Bottle' },
  { id: 'Chicken House', name: 'Chicken House', type: 'chest', screen: 'chicken-house', vanillaItem: '10 Bombs' },
  { id: "Aginah's Cave", name: "Aginah's Cave", type: 'chest', screen: 'aginahs-cave', vanillaItem: 'Heart Piece' },

  // Sahasrahla's Hut
  { id: "Sahasrahla's Hut - Left", name: "Sahasrahla's Hut - Left", type: 'chest', screen: 'sahasrahlas-hut', vanillaItem: '50 Rupees' },
  { id: "Sahasrahla's Hut - Middle", name: "Sahasrahla's Hut - Middle", type: 'chest', screen: 'sahasrahlas-hut', vanillaItem: '3 Bombs' },
  { id: "Sahasrahla's Hut - Right", name: "Sahasrahla's Hut - Right", type: 'chest', screen: 'sahasrahlas-hut', vanillaItem: '50 Rupees' },
  { id: 'Sahasrahla', name: 'Sahasrahla', type: 'npc', screen: 'sahasrahlas-hut', vanillaItem: 'Pegasus Boots' },

  // Kakariko Well
  { id: 'Kakariko Well - Top', name: 'Kakariko Well - Top', type: 'chest', screen: 'kakariko-well-top', vanillaItem: 'Heart Piece' },
  { id: 'Kakariko Well - Left', name: 'Kakariko Well - Left', type: 'chest', screen: 'kakariko-well-top', vanillaItem: '20 Rupees' },
  { id: 'Kakariko Well - Middle', name: 'Kakariko Well - Middle', type: 'chest', screen: 'kakariko-well-top', vanillaItem: '20 Rupees' },
  { id: 'Kakariko Well - Right', name: 'Kakariko Well - Right', type: 'chest', screen: 'kakariko-well-top', vanillaItem: '20 Rupees' },
  { id: 'Kakariko Well - Bottom', name: 'Kakariko Well - Bottom', type: 'chest', screen: 'kakariko-well-top', vanillaItem: '3 Bombs' },

  // NPCs
  { id: 'Blacksmith', name: 'Blacksmith', type: 'npc', screen: 'blacksmiths-hut', vanillaItem: 'Tempered Sword' },
  { id: 'Magic Bat', name: 'Magic Bat', type: 'npc', screen: 'bat-cave-right', vanillaItem: 'Magic Upgrade (1/2)' },
  { id: 'Sick Kid', name: 'Sick Kid', type: 'npc', screen: 'sick-kids-house', vanillaItem: 'Bug Catching Net' },
  { id: 'Hobo', name: 'Hobo', type: 'npc', screen: 'hobo-bridge', vanillaItem: 'Bottle' },

  // Misc Light World
  { id: 'Lost Woods Hideout', name: 'Lost Woods Hideout', type: 'standing', screen: 'lost-woods-hideout-top', vanillaItem: 'Heart Piece' },
  { id: 'Lumberjack Tree', name: 'Lumberjack Tree', type: 'standing', screen: 'lumberjack-tree-top', vanillaItem: 'Heart Piece' },
  { id: 'Cave 45', name: 'Cave 45', type: 'standing', screen: 'cave-45', vanillaItem: 'Heart Piece' },
  { id: 'Graveyard Cave', name: 'Graveyard Cave', type: 'chest', screen: 'graveyard-cave', vanillaItem: 'Heart Piece' },
  { id: 'Checkerboard Cave', name: 'Checkerboard Cave', type: 'chest', screen: 'checkerboard-cave', vanillaItem: 'Heart Piece' },

  // Mini Moldorm Cave
  { id: 'Mini Moldorm Cave - Far Left', name: 'Mini Moldorm Cave - Far Left', type: 'chest', screen: 'mini-moldorm-cave', vanillaItem: '50 Rupees' },
  { id: 'Mini Moldorm Cave - Left', name: 'Mini Moldorm Cave - Left', type: 'chest', screen: 'mini-moldorm-cave', vanillaItem: '20 Rupees' },
  { id: 'Mini Moldorm Cave - Right', name: 'Mini Moldorm Cave - Right', type: 'chest', screen: 'mini-moldorm-cave', vanillaItem: '10 Bombs' },
  { id: 'Mini Moldorm Cave - Far Right', name: 'Mini Moldorm Cave - Far Right', type: 'chest', screen: 'mini-moldorm-cave', vanillaItem: '50 Rupees' },
  { id: 'Mini Moldorm Cave - Generous Guy', name: 'Mini Moldorm Cave - Generous Guy', type: 'npc', screen: 'mini-moldorm-cave', vanillaItem: '300 Rupees' },

  // More Light World
  { id: 'Ice Rod Cave', name: 'Ice Rod Cave', type: 'chest', screen: 'ice-rod-cave', vanillaItem: 'Ice Rod' },
  { id: 'Bonk Rock Cave', name: 'Bonk Rock Cave', type: 'chest', screen: 'bonk-rock-cave', vanillaItem: 'Heart Piece' },
  { id: 'Library', name: 'Library', type: 'standing', screen: 'library', vanillaItem: 'Book of Mudora' },
  { id: 'Potion Shop', name: 'Potion Shop', type: 'npc', screen: 'potion-shop', vanillaItem: 'Magic Powder' },
  { id: 'Lake Hylia Island', name: 'Lake Hylia Island', type: 'standing', screen: 'lake-hylia-island', vanillaItem: 'Heart Piece' },
  { id: 'Maze Race', name: 'Maze Race', type: 'standing', screen: 'maze-race-ledge', vanillaItem: 'Heart Piece' },
  { id: 'Desert Ledge', name: 'Desert Ledge', type: 'standing', screen: 'desert-ledge', vanillaItem: 'Heart Piece' },

  // Death Mountain Area
  { id: 'Old Man', name: 'Old Man', type: 'npc', screen: 'old-man-cave', vanillaItem: 'Magic Mirror' },
  { id: 'Spectacle Rock Cave', name: 'Spectacle Rock Cave', type: 'chest', screen: 'spectacle-rock-cave-top', vanillaItem: 'Heart Piece' },

  // Paradox Cave
  { id: 'Paradox Cave Lower - Far Left', name: 'Paradox Cave Lower - Far Left', type: 'chest', screen: 'paradox-cave-chest-area', vanillaItem: '20 Rupees' },
  { id: 'Paradox Cave Lower - Left', name: 'Paradox Cave Lower - Left', type: 'chest', screen: 'paradox-cave-chest-area', vanillaItem: '20 Rupees' },
  { id: 'Paradox Cave Lower - Right', name: 'Paradox Cave Lower - Right', type: 'chest', screen: 'paradox-cave-chest-area', vanillaItem: '20 Rupees' },
  { id: 'Paradox Cave Lower - Far Right', name: 'Paradox Cave Lower - Far Right', type: 'chest', screen: 'paradox-cave-chest-area', vanillaItem: '20 Rupees' },
  { id: 'Paradox Cave Lower - Middle', name: 'Paradox Cave Lower - Middle', type: 'chest', screen: 'paradox-cave-chest-area', vanillaItem: '20 Rupees' },
  { id: 'Paradox Cave Upper - Left', name: 'Paradox Cave Upper - Left', type: 'chest', screen: 'paradox-cave-chest-area', vanillaItem: '10 Arrows' },
  { id: 'Paradox Cave Upper - Right', name: 'Paradox Cave Upper - Right', type: 'chest', screen: 'paradox-cave-chest-area', vanillaItem: '10 Arrows' },

  // Spiral Cave / Death Mountain Top
  { id: 'Spiral Cave', name: 'Spiral Cave', type: 'chest', screen: 'spiral-cave-top', vanillaItem: '50 Rupees' },
  { id: 'Ether Tablet', name: 'Ether Tablet', type: 'standing', screen: 'death-mountain-top', vanillaItem: 'Ether' },
  { id: 'Spectacle Rock', name: 'Spectacle Rock', type: 'standing', screen: 'spectacle-rock', vanillaItem: 'Heart Piece' },
  { id: 'Master Sword Pedestal', name: 'Master Sword Pedestal', type: 'standing', screen: 'master-sword-meadow', vanillaItem: 'Progressive Sword' },
  { id: 'Floating Island', name: 'Floating Island', type: 'standing', screen: 'death-mountain-floating-island-lw', vanillaItem: 'Heart Piece' },
  { id: 'Mimic Cave', name: 'Mimic Cave', type: 'chest', screen: 'mimic-cave', vanillaItem: 'Heart Piece' },
  { id: 'Spike Cave', name: 'Spike Cave', type: 'chest', screen: 'spike-cave', vanillaItem: 'Cane of Byrna' },
];

export { LIGHT_WORLD_CHECKS };
