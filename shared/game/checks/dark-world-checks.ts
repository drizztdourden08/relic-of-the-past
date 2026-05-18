import type { CheckDefinition } from '../types';

export const DARK_WORLD_CHECKS: CheckDefinition[] = [
  { id: 'Pyramid', name: 'Pyramid', type: 'standing', region: 'east-dark-world', vanillaItem: 'Heart Piece' },
  { id: 'Catfish', name: 'Catfish', type: 'npc', region: 'catfish', vanillaItem: 'Quake' },
  { id: 'Stumpy', name: 'Stumpy', type: 'npc', region: 'south-dark-world', vanillaItem: 'Shovel' },
  { id: 'Digging Game', name: 'Digging Game', type: 'dig', region: 'south-dark-world', vanillaItem: 'Heart Piece' },
  { id: 'Bombos Tablet', name: 'Bombos Tablet', type: 'standing', region: 'bombos-tablet-ledge', vanillaItem: 'Bombos' },
  { id: 'Frog', name: 'Frog', type: 'npc', region: 'west-dark-world' },
  { id: 'Missing Smith', name: 'Missing Smith', type: 'npc', region: 'blacksmiths-hut' },
  { id: 'Dark Blacksmith Ruins', name: 'Dark Blacksmith Ruins', type: 'standing', region: 'hammer-peg-area', vanillaItem: '20 Rupees' },

  // Hype Cave
  { id: 'Hype Cave - Top', name: 'Hype Cave - Top', type: 'chest', region: 'hype-cave', vanillaItem: '50 Rupees' },
  { id: 'Hype Cave - Middle Right', name: 'Hype Cave - Middle Right', type: 'chest', region: 'hype-cave', vanillaItem: '20 Rupees' },
  { id: 'Hype Cave - Middle Left', name: 'Hype Cave - Middle Left', type: 'chest', region: 'hype-cave', vanillaItem: '20 Rupees' },
  { id: 'Hype Cave - Bottom', name: 'Hype Cave - Bottom', type: 'chest', region: 'hype-cave', vanillaItem: '20 Rupees' },
  { id: 'Hype Cave - Generous Guy', name: 'Hype Cave - Generous Guy', type: 'npc', region: 'hype-cave', vanillaItem: '300 Rupees' },

  // Mire Shed
  { id: 'Mire Shed - Left', name: 'Mire Shed - Left', type: 'chest', region: 'mire-shed', vanillaItem: 'Heart Piece' },
  { id: 'Mire Shed - Right', name: 'Mire Shed - Right', type: 'chest', region: 'mire-shed', vanillaItem: '20 Rupees' },

  // Superbunny Cave
  { id: 'Superbunny Cave - Top', name: 'Superbunny Cave - Top', type: 'chest', region: 'superbunny-cave-top', vanillaItem: '20 Rupees' },
  { id: 'Superbunny Cave - Bottom', name: 'Superbunny Cave - Bottom', type: 'chest', region: 'superbunny-cave-top', vanillaItem: '20 Rupees' },

  // Hookshot Cave
  { id: 'Hookshot Cave - Top Right', name: 'Hookshot Cave - Top Right', type: 'chest', region: 'hookshot-cave', vanillaItem: '50 Rupees' },
  { id: 'Hookshot Cave - Top Left', name: 'Hookshot Cave - Top Left', type: 'chest', region: 'hookshot-cave', vanillaItem: '50 Rupees' },
  { id: 'Hookshot Cave - Bottom Right', name: 'Hookshot Cave - Bottom Right', type: 'chest', region: 'hookshot-cave', vanillaItem: '50 Rupees' },
  { id: 'Hookshot Cave - Bottom Left', name: 'Hookshot Cave - Bottom Left', type: 'chest', region: 'hookshot-cave', vanillaItem: '50 Rupees' },

  // ─── Event / Boss Checks ───

  { id: 'Ganon', name: 'Ganon', type: 'boss', region: 'pyramid' },
  { id: 'Agahnim 1', name: 'Agahnim 1', type: 'boss', region: 'agahnim-1', dungeon: 'Castle Tower' },
  { id: 'Agahnim 2', name: 'Agahnim 2', type: 'boss', region: 'agahnim-2', dungeon: "Ganon's Tower" },
];
