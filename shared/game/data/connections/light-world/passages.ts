/* @layer shared-game @kind data */
import type { ScreenConnection } from '../../../types';

const LW_PASSAGE_CONNECTIONS: ScreenConnection[] = [
  // Hyrule Castle Secret Entrance
  { from: 'lw-1b', to: 'hyrule-castle-secret-entrance', tags: ['transit:hole', 'dir:one-way', 'ctx:entrance'] },
  { from: 'light-world-rain', to: 'hyrule-castle-secret-entrance', tags: ['transit:hole', 'dir:one-way', 'ctx:entrance', 'barrier:event'] },
  { from: 'hyrule-castle-courtyard', to: 'hyrule-castle-secret-entrance', tags: ['transit:stairs', 'dir:two-way', 'ctx:entrance'] },
  { from: 'hyrule-castle-secret-entrance', to: 'lw-1b', tags: ['transit:door', 'dir:one-way', 'ctx:internal'] },

  // Old Man Cave (connects death-mountain-entrance ↔ death-mountain)
  { from: 'death-mountain-entrance', to: 'old-man-cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'death-mountain', to: 'old-man-cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'old-man-cave', to: 'death-mountain', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
  { from: 'old-man-cave', to: 'death-mountain-entrance', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
  { from: 'menu', to: 'old-man-cave', tags: ['transit:warp', 'dir:one-way', 'ctx:save-quit'] },

  // Spectacle Rock Cave (connects death-mountain ↔ death-mountain-top)
  { from: 'death-mountain', to: 'spectacle-rock-cave-bottom', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'death-mountain-top', to: 'spectacle-rock-cave-peak', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'spectacle-rock-cave-bottom', to: 'spectacle-rock-cave-top', tags: ['transit:stairs', 'dir:one-way', 'ctx:internal', 'barrier:dark'] },
  { from: 'spectacle-rock-cave-top', to: 'death-mountain-top', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
  { from: 'spectacle-rock-cave-peak', to: 'spectacle-rock', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // Death Mountain Return Cave
  { from: 'death-mountain-return-ledge', to: 'death-mountain-return-cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'death-mountain-return-cave', to: 'lw-0a', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // Spiral Cave
  { from: 'east-death-mountain-bottom', to: 'spiral-cave-bottom', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'spiral-cave-top', to: 'spiral-cave-bottom', tags: ['transit:stairs', 'dir:one-way', 'ctx:internal'] },
  { from: 'spiral-cave-bottom', to: 'east-death-mountain-bottom', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // Fairy Ascension Cave
  { from: 'fairy-ascension-plateau', to: 'fairy-ascension-cave-bottom', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'fairy-ascension-ledge', to: 'fairy-ascension-cave-top', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'fairy-ascension-cave-bottom', to: 'fairy-ascension-cave-drop', tags: ['transit:stairs', 'dir:one-way', 'ctx:internal'] },
  { from: 'fairy-ascension-cave-top', to: 'fairy-ascension-cave-drop', tags: ['transit:hole', 'dir:one-way', 'ctx:internal'] },
  { from: 'fairy-ascension-cave-drop', to: 'fairy-ascension-plateau', tags: ['transit:door', 'dir:one-way', 'ctx:exit'] },
];

export { LW_PASSAGE_CONNECTIONS };
