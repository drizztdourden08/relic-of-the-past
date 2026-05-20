import type { RegionDefinition } from '../../types';

/**
 * Dark World overworld logical locations — graph nodes for pathfinding.
 * These represent specific spots/areas on overworld screens that are
 * logically distinct for connection/reachability purposes.
 * They do NOT have inGameIndex (detection uses the per-screen entries).
 */
export const DW_OVERWORLD_AREAS: RegionDefinition[] = [
  // ─── General DW Areas ───
  { id: 'east-dark-world', name: 'East Dark World', type: 'darkWorld', displayName: 'Dark Eastern', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_east'] },
  { id: 'west-dark-world', name: 'West Dark World', type: 'darkWorld', displayName: 'Village of Outcasts', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:village_of_outcasts'] },
  { id: 'south-dark-world', name: 'South Dark World', type: 'darkWorld', displayName: 'Swamp of Evil', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_south'] },
  { id: 'northeast-dark-world', name: 'Northeast Dark World', type: 'darkWorld', displayName: 'Dark Eastern', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_north'] },
  { id: 'dark-grassy-lawn', name: 'Dark Grassy Lawn', type: 'darkWorld', displayName: 'Dark Central', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_north'] },

  // ─── Dark Death Mountain ───
  { id: 'dark-death-mountain-top', name: 'Dark Death Mountain Top', type: 'darkWorld', displayName: 'Dark Death Mountain', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'] },
  { id: 'dark-death-mountain-west-bottom', name: 'Dark Death Mountain West (Bottom)', type: 'darkWorld', displayName: 'Dark Death Mountain', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'] },
  { id: 'dark-death-mountain-east-bottom', name: 'Dark Death Mountain East (Bottom)', type: 'darkWorld', displayName: 'Dark Death Mountain', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'] },
  { id: 'dark-death-mountain-bunny-descent', name: 'Dark Death Mountain Bunny Descent', type: 'darkWorld', displayName: 'Dark Death Mountain', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'] },
  { id: 'dark-death-mountain-ledge', name: 'Dark Death Mountain Ledge', type: 'darkWorld', displayName: 'Dark Death Mountain', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'] },
  { id: 'dark-death-mountain-isolated-ledge', name: 'Dark Death Mountain Isolated Ledge', type: 'darkWorld', displayName: 'Dark Death Mountain', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'] },
  { id: 'death-mountain-floating-island-dw', name: 'Floating Island (DW)', type: 'darkWorld', displayName: 'Dark Death Mountain', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'] },
  { id: 'mimic-cave-ledge', name: 'Mimic Cave Ledge', type: 'darkWorld', displayName: 'Dark Death Mountain', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'] },

  // ─── Pyramid Area ───
  { id: 'pyramid-ledge', name: 'Pyramid Ledge', type: 'darkWorld', displayName: 'Pyramid of Power', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_north'] },

  // ─── Skull Woods Area ───
  { id: 'skull-woods-forest', name: 'Skull Woods Forest', type: 'darkWorld', displayName: 'Skull Woods', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:skull_woods_area'] },
  { id: 'skull-woods-forest-west', name: 'Skull Woods Forest (West)', type: 'darkWorld', displayName: 'Skull Woods', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:skull_woods_area'] },

  // ─── Dark Desert ───
  { id: 'dark-desert', name: 'Dark Desert', type: 'darkWorld', displayName: 'Swamp of Evil', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_mire'] },

  // ─── Dark Lake Hylia ───
  { id: 'dark-lake-hylia', name: 'Dark Lake Hylia', type: 'darkWorld', displayName: 'Dark Lake', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_lake_hylia'] },
  { id: 'dark-lake-hylia-central-island', name: 'Dark Lake Hylia Central Island', type: 'darkWorld', displayName: 'Dark Lake', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_lake_hylia'] },
  { id: 'dark-lake-hylia-ledge', name: 'Dark Lake Hylia Ledge', type: 'darkWorld', displayName: 'Dark Lake', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_lake_hylia'] },

  // ─── Other ───
  { id: 'bumper-cave-entrance', name: 'Bumper Cave Entrance', type: 'darkWorld', displayName: 'Dark Death Mountain', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain', 'role:connector'] },
  { id: 'bumper-cave-ledge', name: 'Bumper Cave Ledge', type: 'darkWorld', displayName: 'Dark Death Mountain', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_death_mountain'] },
  { id: 'catfish', name: 'Catfish', type: 'darkWorld', displayName: 'Dark Eastern', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:dark_east'] },
  { id: 'hammer-peg-area', name: 'Hammer Peg Area', type: 'darkWorld', displayName: 'Village of Outcasts', tags: ['world:dark', 'env:outside', 'type:overworld', 'area:village_of_outcasts'] },
];
