/* @layer shared-game @kind data */
import type { ScreenDefinition } from '../../../types';

/**
 * Light World overworld logical locations — graph nodes for pathfinding.
 * These represent specific spots/areas on overworld screens that are
 * logically distinct for connection/reachability purposes.
 * They do NOT have inGameIndex (detection uses the per-screen entries).
 */
const LW_OVERWORLD_AREAS: ScreenDefinition[] = [
  { id: 'light-world', name: 'Light World', type: 'overworld', world: 'light', location: 'Hyrule', area: 'Central Hyrule', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor', 'role:spawn'] },
  { id: 'light-world-rain', name: 'Light World (Rain)', type: 'overworld', world: 'light', location: 'Hyrule', area: 'Central Hyrule', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'zoras-river', name: 'Northern River', type: 'overworld', world: 'light', location: 'Eastern Hyrule', area: 'East Hyrule', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'master-sword-meadow', name: 'Pedestal Meadow', type: 'overworld', world: 'light', location: 'Lost Woods', area: 'Lost Woods', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor', 'loot:chest'] },
  { id: 'death-mountain', name: 'Death Mountain', type: 'overworld', world: 'light', location: 'Death Mountain', area: 'Death Mountain', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'death-mountain-entrance', name: 'Death Mountain Entrance', type: 'overworld', world: 'light', location: 'Death Mountain', area: 'Death Mountain', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor', 'role:connector'] },
  { id: 'death-mountain-top', name: 'Death Mountain Top', type: 'overworld', world: 'light', location: 'Death Mountain', area: 'Death Mountain', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'death-mountain-return-ledge', name: 'Death Mountain Return Ledge', type: 'overworld', world: 'light', location: 'Death Mountain', area: 'Death Mountain', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'east-death-mountain-bottom', name: 'East Death Mountain (Bottom)', type: 'overworld', world: 'light', location: 'Death Mountain', area: 'Death Mountain', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'east-death-mountain-top', name: 'East Death Mountain (Top)', type: 'overworld', world: 'light', location: 'Death Mountain', area: 'Death Mountain', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'death-mountain-floating-island-lw', name: 'Floating Island (LW)', type: 'overworld', world: 'light', location: 'Death Mountain', area: 'Death Mountain', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'spectacle-rock', name: 'Spectacle Rock', type: 'overworld', world: 'light', location: 'Death Mountain', area: 'Death Mountain', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor', 'loot:chest'] },
  { id: 'spiral-cave-ledge', name: 'Spiral Cave Ledge', type: 'overworld', world: 'light', location: 'Death Mountain', area: 'Death Mountain', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'fairy-ascension-ledge', name: 'Fairy Ascension Ledge', type: 'overworld', world: 'light', location: 'Death Mountain', area: 'Death Mountain', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'fairy-ascension-plateau', name: 'Fairy Ascension Plateau', type: 'overworld', world: 'light', location: 'Death Mountain', area: 'Death Mountain', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'hyrule-castle-courtyard', name: 'First Castle Courtyard', type: 'overworld', world: 'light', location: 'Hyrule Castle', area: 'Hyrule Castle', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'hyrule-castle-ledge', name: 'First Castle Ledge', type: 'overworld', world: 'light', location: 'Hyrule Castle', area: 'Hyrule Castle', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'graveyard-ledge', name: 'Graveyard Ledge', type: 'overworld', world: 'light', location: 'Sanctuary', area: 'Hyrule Castle', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'kings-grave-area', name: 'King\'s Grave Area', type: 'overworld', world: 'light', location: 'Sanctuary', area: 'East Hyrule', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'bat-cave-drop-ledge', name: 'Bat Cave Drop Ledge', type: 'overworld', world: 'light', location: 'Kakariko Village', area: 'Kakariko', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'maze-race-ledge', name: 'Maze Race Ledge', type: 'overworld', world: 'light', location: 'Kakariko Village', area: 'Kakariko', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'desert-ledge', name: 'Desert Ledge', type: 'overworld', world: 'light', location: 'Desert of Mystery', area: 'Desert', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'desert-ledge-northeast', name: 'Desert Ledge (NE)', type: 'overworld', world: 'light', location: 'Desert of Mystery', area: 'Desert', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'desert-northern-cliffs', name: 'Desert Northern Cliffs', type: 'overworld', world: 'light', location: 'Desert of Mystery', area: 'Desert', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'desert-palace-east', name: 'Desert Palace (East Entrance)', type: 'overworld', world: 'light', location: 'Desert of Mystery', area: 'Desert', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'desert-palace-entrance-north-spot', name: 'Desert Palace North Spot', type: 'overworld', world: 'light', location: 'Desert of Mystery', area: 'Desert', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'desert-palace-lone-stairs', name: 'Desert Palace Lone Stairs', type: 'overworld', world: 'light', location: 'Desert of Mystery', area: 'Desert', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'desert-palace-stairs', name: 'Desert Palace Stairs', type: 'overworld', world: 'light', location: 'Desert of Mystery', area: 'Desert', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'bombos-tablet-ledge', name: 'Bombos Tablet Ledge', type: 'overworld', world: 'light', location: 'Desert of Mystery', area: 'Desert', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'cave-45-ledge', name: 'Cave 45 Ledge', type: 'overworld', world: 'light', location: 'Central Hyrule', area: 'South Hyrule', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'lake-hylia-central-island', name: 'Great Lake Central Island', type: 'overworld', world: 'light', location: 'Lake Hylia', area: 'Lake Hylia', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
  { id: 'lake-hylia-island', name: 'Great Lake Island', type: 'overworld', world: 'light', location: 'Lake Hylia', area: 'Lake Hylia', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor', 'loot:chest'] },
  { id: 'pyramid-ledge-lw', name: 'Pyramid Ledge (LW side)', type: 'overworld', world: 'light', location: 'Hyrule Castle', area: 'Hyrule Castle', overworld: { gridX: 0, gridY: 0 }, tags: ['env:outdoor'] },
];

export { LW_OVERWORLD_AREAS };
