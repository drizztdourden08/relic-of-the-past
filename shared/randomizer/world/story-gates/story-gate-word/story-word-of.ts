/* @layer shared-game @kind logic */
import {
  BARRIER_MODE, BOMB_SHOP_MODE, ORIGINAL_CRYSTAL_COUNT, PEDESTAL_MODE, PYRAMID_MODE, STORY_BIT, STORY_FIELD,
} from './story-gate-word.constants';
import type { CountGate, StoryGateSetting } from '../story-gate.type';

const field = (name: keyof typeof STORY_FIELD, value: number): number =>
  (value & STORY_FIELD[name].mask) << STORY_FIELD[name].shift;

const countField = (name: 'towerCount' | 'ganonCount', kindBit: number, gate: CountGate): number => {
  if (gate.kind === 'crystals' && gate.count === ORIGINAL_CRYSTAL_COUNT) return 0;
  return field(name, gate.count) | (gate.kind === 'darkWorldDungeons' ? kindBit : 0);
};

const storyWordOf = (s: StoryGateSetting): number => {
  let word = STORY_BIT.eventLedger | STORY_BIT.giverReoffer;
  if (s.pedestalScenes) word |= STORY_BIT.pedestalScenes;
  word |= field('pedestalGate', PEDESTAL_MODE[s.pedestal]);
  if (s.sahasrahla === 'easternPalace') word |= STORY_BIT.sahasrahlaGate;
  word |= field('barrierGate', BARRIER_MODE[s.barrier]);
  word |= field('bombShopGate', BOMB_SHOP_MODE[s.bombShop]);
  if (!s.bombShopAsksSmiths) word |= STORY_BIT.bombShopSmith;
  word |= countField('towerCount', STORY_BIT.towerCountKind, s.tower);
  word |= countField('ganonCount', STORY_BIT.ganonCountKind, s.ganon);
  word |= field('pyramidHole', PYRAMID_MODE[s.pyramidHole]);
  if (s.heraMusic) word |= STORY_BIT.heraMusic;
  if (s.vaneScene) word |= STORY_BIT.vaneScene;
  if (s.mountainRespawn) word |= STORY_BIT.mountainRespawn;
  return word >>> 0;
};

export { storyWordOf };
