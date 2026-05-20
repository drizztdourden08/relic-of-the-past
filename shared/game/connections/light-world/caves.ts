import type { RegionConnection } from '../../types';

export const LW_CAVE_CONNECTIONS: RegionConnection[] = [
  // Desert area
  { from: 'light-world', to: 'aginahs-cave', entrance: 'Aginahs Cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'desert-northern-cliffs', to: 'checkerboard-cave', entrance: 'Checkerboard Cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // Kakariko / Central
  { from: 'light-world', to: 'bonk-rock-cave', entrance: 'Bonk Rock Cave', tags: ['transit:bonk', 'dir:two-way', 'ctx:entrance', 'barrier:dash'] },
  { from: 'light-world', to: 'bat-cave-right', entrance: 'Bat Cave Cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'bat-cave-drop-ledge', to: 'bat-cave-right', entrance: 'Bat Cave Drop', tags: ['transit:hole', 'dir:one-way', 'ctx:entrance'] },
  { from: 'bat-cave-right', to: 'bat-cave-left', entrance: 'Bat Cave Door', tags: ['transit:door', 'dir:two-way', 'ctx:internal', 'barrier:hammer'] },
  { from: 'bat-cave-left', to: 'light-world', entrance: 'Bat Cave Exit', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // East / Graveyard
  { from: 'kings-grave-area', to: 'kings-grave', entrance: 'Kings Grave', tags: ['transit:grave', 'dir:one-way', 'ctx:entrance', 'barrier:gloves'] },
  { from: 'kings-grave', to: 'kings-grave-area', entrance: 'Kings Grave Exit', tags: ['transit:door', 'dir:one-way', 'ctx:exit'] },
  { from: 'graveyard-ledge', to: 'graveyard-cave', entrance: 'Graveyard Cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // South / Lake Hylia
  { from: 'light-world', to: 'mini-moldorm-cave', entrance: 'Mini Moldorm Cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'ice-rod-cave', entrance: 'Ice Rod Cave', tags: ['transit:bomb', 'dir:two-way', 'ctx:entrance', 'barrier:bomb'] },
  { from: 'light-world', to: 'good-bee-cave', entrance: 'Good Bee Cave', tags: ['transit:bomb', 'dir:two-way', 'ctx:entrance', 'barrier:bomb'] },
  { from: 'light-world', to: '20-rupee-cave', entrance: '20 Rupee Cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: '50-rupee-cave', entrance: '50 Rupee Cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'cave-45-ledge', to: 'cave-45', entrance: 'Cave 45', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // Lost Woods
  { from: 'light-world', to: 'lost-woods-hideout-top', entrance: 'Lost Woods Hideout Drop', tags: ['transit:hole', 'dir:one-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'lost-woods-hideout-bottom', entrance: 'Lost Woods Hideout Stump', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'light-world', to: 'lumberjack-tree-top', entrance: 'Lumberjack Tree Tree', tags: ['transit:hole', 'dir:one-way', 'ctx:entrance', 'barrier:dash'] },
  { from: 'light-world', to: 'lumberjack-tree-bottom', entrance: 'Lumberjack Tree Cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'lost-woods-hideout-top', to: 'lost-woods-hideout-bottom', entrance: 'Lost Woods Hideout Drop', tags: ['transit:hole', 'dir:one-way', 'ctx:internal'] },
  { from: 'lost-woods-hideout-bottom', to: 'light-world', entrance: 'Lost Woods Hideout Exit', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
  { from: 'lumberjack-tree-top', to: 'lumberjack-tree-bottom', entrance: 'Lumberjack Tree Drop', tags: ['transit:hole', 'dir:one-way', 'ctx:internal'] },
  { from: 'lumberjack-tree-bottom', to: 'light-world', entrance: 'Lumberjack Tree Exit', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // Death Mountain
  { from: 'death-mountain', to: 'spectacle-rock-cave-top', entrance: 'Spectacle Rock Cave (Top)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'east-death-mountain-bottom', to: 'paradox-cave-front', entrance: 'Paradox Cave (Bottom)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'east-death-mountain-top', to: 'paradox-cave', entrance: 'Paradox Cave (Top)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'spiral-cave-ledge', to: 'spiral-cave-top', entrance: 'Spiral Cave (Top)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'mimic-cave-ledge', to: 'mimic-cave', entrance: 'Mimic Cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },

  // Cave internals (Death Mountain)
  { from: 'paradox-cave-front', to: 'paradox-cave-chest-area', entrance: 'Paradox Cave Push Block', tags: ['transit:push', 'dir:one-way', 'ctx:internal'] },
  { from: 'paradox-cave-chest-area', to: 'paradox-cave-front', entrance: 'Paradox Cave Push Block Reverse', tags: ['transit:walk', 'dir:one-way', 'ctx:internal'] },
  { from: 'paradox-cave', to: 'east-death-mountain-top', entrance: 'Paradox Cave Exit (Top)', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
  { from: 'paradox-cave', to: 'paradox-cave-chest-area', entrance: 'Paradox Cave Inner', tags: ['transit:stairs', 'dir:two-way', 'ctx:internal'] },
];
