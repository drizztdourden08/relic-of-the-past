import type { RegionDefinition } from '../../types';

/**
 * Light World overworld logical locations — graph nodes for pathfinding.
 * These represent specific spots/areas on overworld screens that are
 * logically distinct for connection/reachability purposes.
 * They do NOT have inGameIndex (detection uses the per-screen entries).
 */
export const LW_OVERWORLD_AREAS: RegionDefinition[] = [
  // ─── General Areas ───
  { id: 'light-world', name: 'Light World', type: 'lightWorld', indoor: false, displayName: 'Hyrule', tags: ['world:light', 'env:outside', 'type:overworld', 'area:central_hyrule', 'role:spawn_point'] },
  { id: 'light-world-rain', name: 'Light World (Rain)', type: 'lightWorld', indoor: false, displayName: 'Hyrule', tags: ['world:light', 'env:outside', 'type:overworld', 'area:central_hyrule'] },
  { id: 'zoras-river', name: "Zora's River", type: 'lightWorld', indoor: false, displayName: 'Eastern Hyrule', tags: ['world:light', 'env:outside', 'type:overworld', 'area:east_hyrule'] },
  { id: 'master-sword-meadow', name: 'Master Sword Meadow', type: 'lightWorld', indoor: false, displayName: 'Lost Woods', tags: ['world:light', 'env:outside', 'type:overworld', 'area:lost_woods', 'role:treasure'] },

  // ─── Death Mountain ───
  { id: 'death-mountain', name: 'Death Mountain', type: 'lightWorld', indoor: false, displayName: 'Death Mountain', tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'] },
  { id: 'death-mountain-entrance', name: 'Death Mountain Entrance', type: 'lightWorld', indoor: false, displayName: 'Death Mountain', tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain', 'role:connector'] },
  { id: 'death-mountain-top', name: 'Death Mountain Top', type: 'lightWorld', indoor: false, displayName: 'Death Mountain', tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'] },
  { id: 'death-mountain-return-ledge', name: 'Death Mountain Return Ledge', type: 'lightWorld', indoor: false, displayName: 'Death Mountain', tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'] },
  { id: 'east-death-mountain-bottom', name: 'East Death Mountain (Bottom)', type: 'lightWorld', indoor: false, displayName: 'Death Mountain', tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'] },
  { id: 'east-death-mountain-top', name: 'East Death Mountain (Top)', type: 'lightWorld', indoor: false, displayName: 'Death Mountain', tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'] },
  { id: 'death-mountain-floating-island-lw', name: 'Floating Island (LW)', type: 'lightWorld', indoor: false, displayName: 'Death Mountain', tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'] },
  { id: 'spectacle-rock', name: 'Spectacle Rock', type: 'lightWorld', indoor: false, displayName: 'Death Mountain', tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain', 'role:treasure'] },
  { id: 'spiral-cave-ledge', name: 'Spiral Cave Ledge', type: 'lightWorld', indoor: false, displayName: 'Death Mountain', tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'] },
  { id: 'fairy-ascension-ledge', name: 'Fairy Ascension Ledge', type: 'lightWorld', indoor: false, displayName: 'Death Mountain', tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'] },
  { id: 'fairy-ascension-plateau', name: 'Fairy Ascension Plateau', type: 'lightWorld', indoor: false, displayName: 'Death Mountain', tags: ['world:light', 'env:outside', 'type:overworld', 'area:death_mountain'] },

  // ─── Hyrule Castle Area ───
  { id: 'hyrule-castle-courtyard', name: 'Hyrule Castle Courtyard', type: 'lightWorld', indoor: false, displayName: 'Hyrule Castle', tags: ['world:light', 'env:outside', 'type:overworld', 'area:hyrule_castle'] },
  { id: 'hyrule-castle-ledge', name: 'Hyrule Castle Ledge', type: 'lightWorld', indoor: false, displayName: 'Hyrule Castle', tags: ['world:light', 'env:outside', 'type:overworld', 'area:hyrule_castle'] },

  // ─── Graveyard / Sanctuary ───
  { id: 'graveyard-ledge', name: 'Graveyard Ledge', type: 'lightWorld', indoor: false, displayName: 'Sanctuary', tags: ['world:light', 'env:outside', 'type:overworld', 'area:hyrule_castle'] },
  { id: 'kings-grave-area', name: "King's Grave Area", type: 'lightWorld', indoor: false, displayName: 'Sanctuary', tags: ['world:light', 'env:outside', 'type:overworld', 'area:east_hyrule'] },

  // ─── Kakariko Area ───
  { id: 'bat-cave-drop-ledge', name: 'Bat Cave Drop Ledge', type: 'lightWorld', indoor: false, displayName: 'Kakariko Village', tags: ['world:light', 'env:outside', 'type:overworld', 'area:kakariko'] },
  { id: 'maze-race-ledge', name: 'Maze Race Ledge', type: 'lightWorld', indoor: false, displayName: 'Kakariko Village', tags: ['world:light', 'env:outside', 'type:overworld', 'area:kakariko'] },

  // ─── Desert Area ───
  { id: 'desert-ledge', name: 'Desert Ledge', type: 'lightWorld', indoor: false, displayName: 'Desert of Mystery', tags: ['world:light', 'env:outside', 'type:overworld', 'area:desert'] },
  { id: 'desert-ledge-northeast', name: 'Desert Ledge (NE)', type: 'lightWorld', indoor: false, displayName: 'Desert of Mystery', tags: ['world:light', 'env:outside', 'type:overworld', 'area:desert'] },
  { id: 'desert-northern-cliffs', name: 'Desert Northern Cliffs', type: 'lightWorld', indoor: false, displayName: 'Desert of Mystery', tags: ['world:light', 'env:outside', 'type:overworld', 'area:desert'] },
  { id: 'desert-palace-east', name: 'Desert Palace (East Entrance)', type: 'lightWorld', indoor: false, displayName: 'Desert of Mystery', tags: ['world:light', 'env:outside', 'type:overworld', 'area:desert'] },
  { id: 'desert-palace-entrance-north-spot', name: 'Desert Palace North Spot', type: 'lightWorld', indoor: false, displayName: 'Desert of Mystery', tags: ['world:light', 'env:outside', 'type:overworld', 'area:desert'] },
  { id: 'desert-palace-lone-stairs', name: 'Desert Palace Lone Stairs', type: 'lightWorld', indoor: false, displayName: 'Desert of Mystery', tags: ['world:light', 'env:outside', 'type:overworld', 'area:desert'] },
  { id: 'desert-palace-stairs', name: 'Desert Palace Stairs', type: 'lightWorld', indoor: false, displayName: 'Desert of Mystery', tags: ['world:light', 'env:outside', 'type:overworld', 'area:desert'] },
  { id: 'bombos-tablet-ledge', name: 'Bombos Tablet Ledge', type: 'lightWorld', indoor: false, displayName: 'Desert of Mystery', tags: ['world:light', 'env:outside', 'type:overworld', 'area:desert'] },

  // ─── South / Lake Hylia ───
  { id: 'cave-45-ledge', name: 'Cave 45 Ledge', type: 'lightWorld', indoor: false, displayName: 'Central Hyrule', tags: ['world:light', 'env:outside', 'type:overworld', 'area:south_hyrule'] },
  { id: 'lake-hylia-central-island', name: 'Lake Hylia Central Island', type: 'lightWorld', indoor: false, displayName: 'Lake Hylia', tags: ['world:light', 'env:outside', 'type:overworld', 'area:lake_hylia'] },
  { id: 'lake-hylia-island', name: 'Lake Hylia Island', type: 'lightWorld', indoor: false, displayName: 'Lake Hylia', tags: ['world:light', 'env:outside', 'type:overworld', 'area:lake_hylia', 'role:treasure'] },

  // ─── Mirrored from DW ───
  { id: 'pyramid-ledge-lw', name: 'Pyramid Ledge (LW side)', type: 'lightWorld', indoor: false, displayName: 'Hyrule Castle', tags: ['world:light', 'env:outside', 'type:overworld', 'area:hyrule_castle'] },
];
