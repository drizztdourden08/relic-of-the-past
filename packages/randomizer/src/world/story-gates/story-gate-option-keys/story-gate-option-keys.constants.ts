/* @layer shared-game @kind constants */
const STORY_GATE_KEY = {
  pedestalScenes: 'story_pedestal_scenes',
  pedestal: 'story_pedestal_gate',
  sahasrahla: 'story_sahasrahla_gate',
  barrier: 'story_barrier_gate',
  bombShop: 'story_bomb_shop_gate',
  bombShopAsksSmiths: 'story_bomb_shop_smiths',
  towerKind: 'story_tower_count_kind',
  towerCount: 'crystals_needed_for_gt',
  ganonKind: 'story_ganon_count_kind',
  ganonCount: 'crystals_needed_for_ganon',
  pyramidHole: 'open_pyramid',
  heraMusic: 'story_hera_music',
  vaneScene: 'story_vane_scene',
  mountainRespawn: 'story_mountain_respawn',
} as const;

export { STORY_GATE_KEY };
