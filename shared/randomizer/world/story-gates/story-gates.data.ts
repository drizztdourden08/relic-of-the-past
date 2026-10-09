/* @layer shared-game @kind data */
import type { StoryGateSetting } from './story-gate.type';

const DEFAULT_STORY_GATES: StoryGateSetting = {
  pedestalScenes: true,
  pedestal: 'pendants',
  sahasrahla: 'pendant',
  barrier: 'sword',
  bombShop: 'crystals',
  bombShopAsksSmiths: true,
  tower: { kind: 'crystals', count: 7 },
  ganon: { kind: 'crystals', count: 7 },
  pyramidHole: 'agahnim2',
  heraMusic: true,
  vaneScene: true,
  mountainRespawn: true,
};

export { DEFAULT_STORY_GATES };
