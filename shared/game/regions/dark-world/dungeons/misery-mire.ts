import type { RegionDefinition } from '../types';

export const MISERY_MIRE_DUNGEON: RegionDefinition[] = [
  { id: 'misery-mire-entrance', name: 'Misery Mire (Entrance)', type: 'dungeon', dungeon: 'Misery Mire', tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:dark_mire', 'dungeon:misery_mire', 'role:entrance'] },
  { id: 'misery-mire-main', name: 'Misery Mire (Main)', type: 'dungeon', dungeon: 'Misery Mire', tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:dark_mire', 'dungeon:misery_mire', 'role:hub', 'role:dark_room'] },
  { id: 'misery-mire-west', name: 'Misery Mire (West)', type: 'dungeon', dungeon: 'Misery Mire', tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:dark_mire', 'dungeon:misery_mire', 'role:treasure'] },
  { id: 'misery-mire-final-area', name: 'Misery Mire (Final Area)', type: 'dungeon', dungeon: 'Misery Mire', tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:dark_mire', 'dungeon:misery_mire', 'role:connector'] },
  { id: 'misery-mire-vitreous', name: 'Misery Mire (Vitreous)', type: 'dungeon', dungeon: 'Misery Mire', tags: ['world:dark', 'env:underground', 'type:dungeon', 'area:dark_mire', 'dungeon:misery_mire', 'role:boss_room'] },
];
