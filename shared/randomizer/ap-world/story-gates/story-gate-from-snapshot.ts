/* @layer shared-game @kind logic */
/**
 * The story gate rows ⇄ the setting they stand for, both directions in one file so the
 * reading the generator uses and the writing the creation form freezes can never spell
 * the same option two ways. An absent row reads as the default, the story as the game
 * tells it.
 */
import { DEFAULT_STORY_GATES } from './story-gates.data';
import { STORY_GATE_KEY as K } from './story-gate-option-keys';
import type { ApOptionValue, RandomizerOptionsSnapshot } from '../options.type';
import type {
  BombShopGate, CountKind, PedestalGate, PyramidHoleGate, SahasrahlaGate, StoryGateSetting,
} from './story-gate.type';

type Values = Readonly<Record<string, ApOptionValue>>;

const PEDESTAL: readonly PedestalGate[] = ['pendants', 'lightWorldDungeons', 'anyThreeDungeons', 'open', 'onePendant', 'twoPendants'];
const SAHASRAHLA: readonly SahasrahlaGate[] = ['pendant', 'easternPalace'];
const BOMB_SHOP: readonly BombShopGate[] = ['crystals', 'iceAndMire', 'towerCount'];
const COUNT_KIND: readonly CountKind[] = ['crystals', 'darkWorldDungeons'];
/** The reference's own row: closed is the original, goal reads the same here, auto follows the count. */
const PYRAMID: Readonly<Record<string, PyramidHoleGate>> = { closed: 'agahnim2', goal: 'agahnim2', open: 'open', auto: 'towerCount' };
const PYRAMID_VALUE: Readonly<Record<PyramidHoleGate, string>> = { agahnim2: 'goal', open: 'open', towerCount: 'auto' };

const flagOf = (values: Values, key: string, fallback: boolean): boolean =>
  (typeof values[key] === 'boolean' ? values[key] : fallback);
const oneOf = <T extends string>(values: Values, key: string, allowed: readonly T[], fallback: T): T => {
  const v = values[key];
  return typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
};
const countOf = (values: Values, key: string, fallback: number): number => {
  const v = values[key];
  return typeof v === 'number' && v >= 0 && v <= 7 ? Math.trunc(v) : fallback;
};

const storyGatesOfValues = (values: Values): StoryGateSetting => {
  const d = DEFAULT_STORY_GATES;
  return {
    pedestalScenes: flagOf(values, K.pedestalScenes, d.pedestalScenes),
    pedestal: oneOf(values, K.pedestal, PEDESTAL, d.pedestal),
    sahasrahla: oneOf(values, K.sahasrahla, SAHASRAHLA, d.sahasrahla),
    bombShop: oneOf(values, K.bombShop, BOMB_SHOP, d.bombShop),
    bombShopAsksSmiths: flagOf(values, K.bombShopAsksSmiths, d.bombShopAsksSmiths),
    tower: { kind: oneOf(values, K.towerKind, COUNT_KIND, d.tower.kind), count: countOf(values, K.towerCount, d.tower.count) },
    ganon: { kind: oneOf(values, K.ganonKind, COUNT_KIND, d.ganon.kind), count: countOf(values, K.ganonCount, d.ganon.count) },
    pyramidHole: PYRAMID[String(values[K.pyramidHole])] ?? d.pyramidHole,
    heraMusic: flagOf(values, K.heraMusic, d.heraMusic),
    vaneScene: flagOf(values, K.vaneScene, d.vaneScene),
    mountainRespawn: flagOf(values, K.mountainRespawn, d.mountainRespawn),
  };
};

const storyGatesFromSnapshot = (snapshot: RandomizerOptionsSnapshot): StoryGateSetting =>
  storyGatesOfValues(snapshot.values);

/** The rows a setting freezes: what the creation form hands the catalog. */
const storyGateValuesOf = (s: StoryGateSetting): Record<string, ApOptionValue> => ({
  [K.pedestalScenes]: s.pedestalScenes,
  [K.pedestal]: s.pedestal,
  [K.sahasrahla]: s.sahasrahla,
  [K.bombShop]: s.bombShop,
  [K.bombShopAsksSmiths]: s.bombShopAsksSmiths,
  [K.towerKind]: s.tower.kind,
  [K.towerCount]: s.tower.count,
  [K.ganonKind]: s.ganon.kind,
  [K.ganonCount]: s.ganon.count,
  [K.pyramidHole]: PYRAMID_VALUE[s.pyramidHole],
  [K.heraMusic]: s.heraMusic,
  [K.vaneScene]: s.vaneScene,
  [K.mountainRespawn]: s.mountainRespawn,
});

export { storyGateValuesOf, storyGatesFromSnapshot, storyGatesOfValues };
