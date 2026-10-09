/* @layer shared-game @kind logic */
import { optionFlagOf } from '../../option-flag-of';
import { DEFAULT_STORY_GATES } from '../story-gates.data';
import { STORY_GATE_KEY as K } from '../story-gate-option-keys';
import {
  BARRIER_GATES, BOMB_SHOP_GATES, COUNT_KINDS, MAX_GATE_COUNT, PEDESTAL_GATES, PYRAMID_GATE_OF_VALUE, SAHASRAHLA_GATES,
} from './story-gate-from-snapshot.constants';
import type { OptionValues } from '../../options.type';
import type { StoryGateSetting } from '../story-gate.type';

const oneOf = <T extends string>(values: OptionValues, key: string, allowed: readonly T[], fallback: T): T => {
  const v = values[key];
  return typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
};

const gateCountOf = (values: OptionValues, key: string, fallback: number): number => {
  const v = values[key];
  return typeof v === 'number' && v >= 0 && v <= MAX_GATE_COUNT ? Math.trunc(v) : fallback;
};

const storyGatesOfValues = (values: OptionValues): StoryGateSetting => {
  const d = DEFAULT_STORY_GATES;
  return {
    pedestalScenes: optionFlagOf(values, K.pedestalScenes, d.pedestalScenes),
    pedestal: oneOf(values, K.pedestal, PEDESTAL_GATES, d.pedestal),
    sahasrahla: oneOf(values, K.sahasrahla, SAHASRAHLA_GATES, d.sahasrahla),
    barrier: oneOf(values, K.barrier, BARRIER_GATES, d.barrier),
    bombShop: oneOf(values, K.bombShop, BOMB_SHOP_GATES, d.bombShop),
    bombShopAsksSmiths: optionFlagOf(values, K.bombShopAsksSmiths, d.bombShopAsksSmiths),
    tower: { kind: oneOf(values, K.towerKind, COUNT_KINDS, d.tower.kind), count: gateCountOf(values, K.towerCount, d.tower.count) },
    ganon: { kind: oneOf(values, K.ganonKind, COUNT_KINDS, d.ganon.kind), count: gateCountOf(values, K.ganonCount, d.ganon.count) },
    pyramidHole: PYRAMID_GATE_OF_VALUE[String(values[K.pyramidHole])] ?? d.pyramidHole,
    heraMusic: optionFlagOf(values, K.heraMusic, d.heraMusic),
    vaneScene: optionFlagOf(values, K.vaneScene, d.vaneScene),
    mountainRespawn: optionFlagOf(values, K.mountainRespawn, d.mountainRespawn),
  };
};

export { storyGatesOfValues };
