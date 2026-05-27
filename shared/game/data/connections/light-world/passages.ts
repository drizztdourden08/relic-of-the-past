import type { RegionConnection } from '../../types';

export const LW_PASSAGE_CONNECTIONS: RegionConnection[] = [
  // Hyrule Castle Secret Entrance
  { from: 'lw-1b', to: 'hyrule-castle-secret-entrance', entrance: 'Hyrule Castle Secret Entrance Drop', tags: ['transit:hole', 'dir:one-way', 'ctx:entrance'] },
  { from: 'light-world-rain', to: 'hyrule-castle-secret-entrance', entrance: 'HC Secret Entrance Drop (Rain)', tags: ['transit:hole', 'dir:one-way', 'ctx:entrance', 'barrier:event'] },
  { from: 'hyrule-castle-courtyard', to: 'hyrule-castle-secret-entrance', entrance: 'Hyrule Castle Secret Entrance Stairs', tags: ['transit:stairs', 'dir:two-way', 'ctx:entrance'] },
  { from: 'hyrule-castle-secret-entrance', to: 'lw-1b', entrance: 'Secret Passage to Castle', tags: ['transit:door', 'dir:one-way', 'ctx:internal'] },

  // Old Man Cave (connects death-mountain-entrance ↔ death-mountain)
  { from: 'death-mountain-entrance', to: 'old-man-cave', entrance: 'Old Man Cave (West)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'death-mountain', to: 'old-man-cave', entrance: 'Old Man Cave (East)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'old-man-cave', to: 'death-mountain', entrance: 'Old Man Cave Exit (East)', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
  { from: 'old-man-cave', to: 'death-mountain-entrance', entrance: 'Old Man Cave Exit (West)', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
  { from: 'menu', to: 'old-man-cave', entrance: 'Old Man S&Q', tags: ['transit:warp', 'dir:one-way', 'ctx:save-quit'] },

  // Spectacle Rock Cave (connects death-mountain ↔ death-mountain-top)
  { from: 'death-mountain', to: 'spectacle-rock-cave-bottom', entrance: 'Spectacle Rock Cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'death-mountain-top', to: 'spectacle-rock-cave-peak', entrance: 'Spectacle Rock Cave Peak', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'spectacle-rock-cave-bottom', to: 'spectacle-rock-cave-top', entrance: 'Spectacle Rock Cave Ascent', tags: ['transit:stairs', 'dir:one-way', 'ctx:internal', 'barrier:dark'] },
  { from: 'spectacle-rock-cave-top', to: 'death-mountain-top', entrance: 'Spectacle Rock Cave Exit (Top)', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },
  { from: 'spectacle-rock-cave-peak', to: 'spectacle-rock', entrance: 'Spectacle Rock Cave Exit (Peak)', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // Death Mountain Return Cave
  { from: 'death-mountain-return-ledge', to: 'death-mountain-return-cave', entrance: 'Death Mountain Return Cave (East)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'death-mountain-return-cave', to: 'lw-0a', entrance: 'Death Mountain Return Cave Exit (West)', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // Spiral Cave
  { from: 'east-death-mountain-bottom', to: 'spiral-cave-bottom', entrance: 'Spiral Cave', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'spiral-cave-top', to: 'spiral-cave-bottom', entrance: 'Spiral Cave', tags: ['transit:stairs', 'dir:one-way', 'ctx:internal'] },
  { from: 'spiral-cave-bottom', to: 'east-death-mountain-bottom', entrance: 'Spiral Cave Exit', tags: ['transit:door', 'dir:two-way', 'ctx:exit'] },

  // Fairy Ascension Cave
  { from: 'fairy-ascension-plateau', to: 'fairy-ascension-cave-bottom', entrance: 'Fairy Ascension Cave (Bottom)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'fairy-ascension-ledge', to: 'fairy-ascension-cave-top', entrance: 'Fairy Ascension Cave (Top)', tags: ['transit:door', 'dir:two-way', 'ctx:entrance'] },
  { from: 'fairy-ascension-cave-bottom', to: 'fairy-ascension-cave-drop', entrance: 'Fairy Ascension Cave Climb', tags: ['transit:stairs', 'dir:one-way', 'ctx:internal'] },
  { from: 'fairy-ascension-cave-top', to: 'fairy-ascension-cave-drop', entrance: 'Fairy Ascension Cave Drop', tags: ['transit:hole', 'dir:one-way', 'ctx:internal'] },
  { from: 'fairy-ascension-cave-drop', to: 'fairy-ascension-plateau', entrance: 'Fairy Ascension Cave Exit', tags: ['transit:door', 'dir:one-way', 'ctx:exit'] },
];
