import type { RegionConnection } from '../../../types';

export const DW_OVERWORLD_VILLAGE_CONNECTIONS: RegionConnection[] = [
  { from: 'west-dark-world', to: 'east-dark-world', entrance: 'East Dark World River Pier', tags: ['transit:swim', 'dir:two-way', 'ctx:overworld', 'barrier:swim'] },
  { from: 'west-dark-world', to: 'skull-woods-forest', entrance: 'Skull Woods Forest', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'west-dark-world', to: 'hammer-peg-area', entrance: 'Village of Outcasts Pegs', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld', 'barrier:hammer'] },
  { from: 'west-dark-world', to: 'south-dark-world', entrance: 'Village of Outcasts Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'west-dark-world', to: 'bumper-cave-entrance', entrance: 'Bumper Cave Entrance Rock', tags: ['transit:rock', 'dir:two-way', 'ctx:overworld', 'barrier:gloves'] },
  { from: 'hammer-peg-area', to: 'west-dark-world', entrance: 'Hammer Peg Area Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'bumper-cave-entrance', to: 'west-dark-world', entrance: 'Bumper Cave Entrance Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'bumper-cave-ledge', to: 'bumper-cave-entrance', entrance: 'Bumper Cave Ledge Drop', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Mirror spots
  { from: 'west-dark-world', to: 'lw-20', entrance: 'West Dark World Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'west-dark-world', to: 'graveyard-ledge', entrance: 'Graveyard Ledge Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'west-dark-world', to: 'kings-grave-area', entrance: 'Kings Grave Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'bumper-cave-ledge', to: 'death-mountain-return-ledge', entrance: 'Bumper Cave Ledge Mirror Spot', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
];
