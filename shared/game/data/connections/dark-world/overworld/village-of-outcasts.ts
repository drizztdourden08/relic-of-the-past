/* @layer shared-game @kind data */
import type { ScreenConnection } from '../../../../types';

const DW_OVERWORLD_VILLAGE_CONNECTIONS: ScreenConnection[] = [
  { from: 'west-dark-world', to: 'east-dark-world', tags: ['transit:swim', 'dir:two-way', 'ctx:overworld', 'barrier:swim'] },
  { from: 'west-dark-world', to: 'skull-woods-forest', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld'] },
  { from: 'west-dark-world', to: 'hammer-peg-area', tags: ['transit:walk', 'dir:two-way', 'ctx:overworld', 'barrier:hammer'] },
  { from: 'west-dark-world', to: 'south-dark-world', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'west-dark-world', to: 'bumper-cave-entrance', tags: ['transit:rock', 'dir:two-way', 'ctx:overworld', 'barrier:gloves'] },
  { from: 'hammer-peg-area', to: 'west-dark-world', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'bumper-cave-entrance', to: 'west-dark-world', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },
  { from: 'bumper-cave-ledge', to: 'bumper-cave-entrance', tags: ['transit:ledge', 'dir:one-way', 'ctx:overworld'] },

  // Mirror spots
  { from: 'west-dark-world', to: 'lw-20', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'west-dark-world', to: 'graveyard-ledge', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'west-dark-world', to: 'kings-grave-area', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
  { from: 'bumper-cave-ledge', to: 'death-mountain-return-ledge', tags: ['transit:mirror', 'dir:one-way', 'ctx:cross-world'] },
];

export { DW_OVERWORLD_VILLAGE_CONNECTIONS };
