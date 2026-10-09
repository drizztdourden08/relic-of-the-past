/* @layer shared-game @kind logic */
import { STORY_GATE_KEY as K } from '../story-gate-option-keys';
import { PYRAMID_VALUE_OF_GATE } from './story-gate-from-snapshot.constants';
import type { OptionValue } from '../../options.type';
import type { StoryGateSetting } from '../story-gate.type';

const storyGateValuesOf = (s: StoryGateSetting): Record<string, OptionValue> => ({
  [K.pedestalScenes]: s.pedestalScenes,
  [K.pedestal]: s.pedestal,
  [K.sahasrahla]: s.sahasrahla,
  [K.barrier]: s.barrier,
  [K.bombShop]: s.bombShop,
  [K.bombShopAsksSmiths]: s.bombShopAsksSmiths,
  [K.towerKind]: s.tower.kind,
  [K.towerCount]: s.tower.count,
  [K.ganonKind]: s.ganon.kind,
  [K.ganonCount]: s.ganon.count,
  [K.pyramidHole]: PYRAMID_VALUE_OF_GATE[s.pyramidHole],
  [K.heraMusic]: s.heraMusic,
  [K.vaneScene]: s.vaneScene,
  [K.mountainRespawn]: s.mountainRespawn,
});

export { storyGateValuesOf };
