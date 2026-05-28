import type { RegionConnection } from '../../../types';

/**
 * Connections between Light World overworld screens and logical area nodes.
 * Each logical area connects to a representative screen in its zone.
 */
export const LW_SCREEN_AREA_CONNECTIONS: RegionConnection[] = [
  { from: 'lw-2b', to: 'light-world', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-2b', to: 'light-world-rain', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-27', to: 'zoras-river', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-08', to: 'master-sword-meadow', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'death-mountain', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'death-mountain-entrance', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'death-mountain-top', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'death-mountain-return-ledge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'east-death-mountain-bottom', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'east-death-mountain-top', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'death-mountain-floating-island-lw', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'spectacle-rock', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'spiral-cave-ledge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'fairy-ascension-ledge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-0a', to: 'fairy-ascension-plateau', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-1c', to: 'hyrule-castle-courtyard', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-1c', to: 'hyrule-castle-ledge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-1c', to: 'graveyard-ledge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-27', to: 'kings-grave-area', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-20', to: 'bat-cave-drop-ledge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-20', to: 'maze-race-ledge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-38', to: 'desert-ledge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-38', to: 'desert-ledge-northeast', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-38', to: 'desert-northern-cliffs', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-38', to: 'desert-palace-east', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-38', to: 'desert-palace-entrance-north-spot', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-38', to: 'desert-palace-lone-stairs', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-38', to: 'bombos-tablet-ledge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-32', to: 'cave-45-ledge', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-3b', to: 'lake-hylia-central-island', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-3b', to: 'lake-hylia-island', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'lw-1c', to: 'pyramid-ledge-lw', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
];
