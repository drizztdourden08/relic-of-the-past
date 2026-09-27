/* @layer shared-game @kind data */
/**
 * The default story gates: the story as the game tells it. The scenes read their recorded
 * event, the counts are the original numbers. A snapshot with no row reads the same way,
 * so a seed rolled before these rows existed keeps its meaning.
 */
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
