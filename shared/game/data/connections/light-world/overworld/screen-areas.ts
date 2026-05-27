import type { RegionConnection } from '../../../types';

/**
 * Connections between Light World overworld screens and logical area nodes.
 * Each logical area connects to a representative screen in its zone.
 */
export const LW_SCREEN_AREA_CONNECTIONS: RegionConnection[] = [
  { from: 'lw-2b', to: 'light-world', entrance: 'Light World Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-2b', to: 'light-world-rain', entrance: 'Light World (Rain) Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-27', to: 'zoras-river', entrance: 'Zora\'s River Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-08', to: 'master-sword-meadow', entrance: 'Master Sword Meadow Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'death-mountain', entrance: 'Death Mountain Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'death-mountain-entrance', entrance: 'Death Mountain Entrance Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'death-mountain-top', entrance: 'Death Mountain Top Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'death-mountain-return-ledge', entrance: 'Death Mountain Return Ledge Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'east-death-mountain-bottom', entrance: 'East Death Mountain (Bottom) Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'east-death-mountain-top', entrance: 'East Death Mountain (Top) Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'death-mountain-floating-island-lw', entrance: 'Floating Island (LW) Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'spectacle-rock', entrance: 'Spectacle Rock Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'spiral-cave-ledge', entrance: 'Spiral Cave Ledge Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'fairy-ascension-ledge', entrance: 'Fairy Ascension Ledge Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'fairy-ascension-plateau', entrance: 'Fairy Ascension Plateau Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-1c', to: 'hyrule-castle-courtyard', entrance: 'Hyrule Castle Courtyard Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-1c', to: 'hyrule-castle-ledge', entrance: 'Hyrule Castle Ledge Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-1c', to: 'graveyard-ledge', entrance: 'Graveyard Ledge Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-27', to: 'kings-grave-area', entrance: 'King\'s Grave Area Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-20', to: 'bat-cave-drop-ledge', entrance: 'Bat Cave Drop Ledge Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-20', to: 'maze-race-ledge', entrance: 'Maze Race Ledge Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-38', to: 'desert-ledge', entrance: 'Desert Ledge Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-38', to: 'desert-ledge-northeast', entrance: 'Desert Ledge (NE) Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-38', to: 'desert-northern-cliffs', entrance: 'Desert Northern Cliffs Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-38', to: 'desert-palace-east', entrance: 'Desert Palace (East Entrance) Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-38', to: 'desert-palace-entrance-north-spot', entrance: 'Desert Palace North Spot Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-38', to: 'desert-palace-lone-stairs', entrance: 'Desert Palace Lone Stairs Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-38', to: 'desert-palace-stairs', entrance: 'Desert Palace Stairs Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-38', to: 'bombos-tablet-ledge', entrance: 'Bombos Tablet Ledge Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-32', to: 'cave-45-ledge', entrance: 'Cave 45 Ledge Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-3b', to: 'lake-hylia-central-island', entrance: 'Lake Hylia Central Island Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-3b', to: 'lake-hylia-island', entrance: 'Lake Hylia Island Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-1c', to: 'pyramid-ledge-lw', entrance: 'Pyramid Ledge (LW side) Access', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
];
