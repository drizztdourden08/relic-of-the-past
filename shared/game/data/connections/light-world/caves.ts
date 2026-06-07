/* @layer shared-game @kind data */
import type { ScreenConnection } from '../../../types';

const LW_CAVE_CONNECTIONS: ScreenConnection[] = [
  // Desert area
  { from: 'lw-30', to: 'aginahs-cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'desert-northern-cliffs', to: 'checkerboard-cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // Kakariko / Central
  { from: 'lw-22', to: 'bonk-rock-cave', tags: ['transit:bonk', 'dir:two-way', 'ctx:entrance', 'barrier:dash'] },
  { from: 'lw-20', to: 'bat-cave-right', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'bat-cave-drop-ledge', to: 'bat-cave-right', tags: ['transit:hole', 'dir:one-way', 'ctx:entrance'] },
  { from: 'bat-cave-right', to: 'bat-cave-left', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:hammer'] },
  { from: 'bat-cave-left', to: 'lw-20', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // East / Graveyard
  { from: 'kings-grave-area', to: 'kings-grave', tags: ['transit:grave', 'dir:one-way', 'ctx:entrance', 'barrier:gloves'] },
  { from: 'kings-grave', to: 'kings-grave-area', tags: ['transit:door', 'dir:one-way', 'ctx:exit'] },
  { from: 'graveyard-ledge', to: 'graveyard-cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // South / Lake Hylia
  { from: 'lw-35', to: 'mini-moldorm-cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-34', to: 'ice-rod-cave', tags: ['transit:bomb', 'dir:two-way', 'ctx:entrance', 'barrier:bomb'] },
  { from: 'lw-35', to: 'good-bee-cave', tags: ['transit:bomb', 'dir:two-way', 'ctx:entrance', 'barrier:bomb'] },
  { from: 'lw-33', to: '20-rupee-cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-34', to: '50-rupee-cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'cave-45-ledge', to: 'cave-45', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // Lost Woods
  { from: 'lw-00', to: 'lost-woods-hideout-top', tags: ['transit:hole', 'dir:one-way', 'ctx:entrance'] },
  { from: 'lw-00', to: 'lost-woods-hideout-bottom', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lw-02', to: 'lumberjack-tree-top', tags: ['transit:hole', 'dir:one-way', 'ctx:entrance', 'barrier:dash'] },
  { from: 'lw-02', to: 'lumberjack-tree-bottom', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lost-woods-hideout-top', to: 'lost-woods-hideout-bottom', tags: ['transit:hole', 'dir:one-way', 'ctx:internal'] },
  { from: 'lost-woods-hideout-bottom', to: 'lw-00', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
  { from: 'lumberjack-tree-top', to: 'lumberjack-tree-bottom', tags: ['transit:hole', 'dir:one-way', 'ctx:internal'] },
  { from: 'lumberjack-tree-bottom', to: 'lw-02', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // Death Mountain
  { from: 'death-mountain', to: 'spectacle-rock-cave-top', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'east-death-mountain-bottom', to: 'paradox-cave-front', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'east-death-mountain-top', to: 'paradox-cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'spiral-cave-ledge', to: 'spiral-cave-top', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // Cave internals (Death Mountain)
  { from: 'paradox-cave-front', to: 'paradox-cave-chest-area', tags: ['transit:push', 'dir:one-way', 'ctx:internal'] },
  { from: 'paradox-cave-chest-area', to: 'paradox-cave-front', tags: ['transit:walk', 'dir:one-way', 'ctx:internal'] },
  { from: 'paradox-cave', to: 'east-death-mountain-top', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
  { from: 'paradox-cave', to: 'paradox-cave-chest-area', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
];

export { LW_CAVE_CONNECTIONS };
