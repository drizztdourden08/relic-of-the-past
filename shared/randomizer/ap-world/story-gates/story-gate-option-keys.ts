/* @layer shared-game @kind logic */
/**
 * The catalog keys the story gate rows occupy, one per field of the setting. The three
 * count rows reuse the reference's own keys where it has them (crystals for the tower and
 * for Ganon, the pyramid hole), so a stored value keeps its name.
 */

const STORY_GATE_KEY = {
  pedestalScenes: 'story_pedestal_scenes',
  pedestal: 'story_pedestal_gate',
  sahasrahla: 'story_sahasrahla_gate',
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

const STORY_GATE_OPTION_KEYS: readonly string[] = Object.values(STORY_GATE_KEY);
const STORY_GATE_KEY_SET: ReadonlySet<string> = new Set(STORY_GATE_OPTION_KEYS);

/** True for a row the story gates section owns. */
const isStoryGateOptionKey = (key: string): boolean => STORY_GATE_KEY_SET.has(key);

export { STORY_GATE_KEY, STORY_GATE_OPTION_KEYS, isStoryGateOptionKey };
