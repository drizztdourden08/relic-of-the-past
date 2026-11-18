/* @layer shared-game @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { DEFAULT_STORY_GATES as D } from './story-gates.constants';
import { STORY_GATE_KEY as K } from './story-gate-option-keys/story-gate-option-keys.constants';
import type { OptionChoice, OptionSeed } from '../options.type';

const STORY_GATE_ROW = { group: 'goal' as const, implementation: 'active' as const, locked: false, synthetic: true };

const COUNT_KIND_CHOICES: readonly OptionChoice[] = [
  { value: 'crystals', sourceValue: 'crystals', label: msg('randomizer:storyGate.countKind.choice.crystals') },
  { value: 'darkWorldDungeons', sourceValue: 'darkWorldDungeons', label: msg('randomizer:storyGate.countKind.choice.darkWorldDungeons') },
];

const STORY_GATE_OPTION_SEEDS: readonly OptionSeed[] = [
  {
    ...STORY_GATE_ROW,
    key: K.pedestal,
    displayName: msg('randomizer:storyGate.pedestal.name'),
    kind: 'choice',
    choices: [
      { value: 'pendants', sourceValue: 'pendants', label: msg('randomizer:storyGate.pedestal.choice.pendants') },
      { value: 'lightWorldDungeons', sourceValue: 'lightWorldDungeons', label: msg('randomizer:storyGate.pedestal.choice.lightWorldDungeons') },
      { value: 'anyThreeDungeons', sourceValue: 'anyThreeDungeons', label: msg('randomizer:storyGate.pedestal.choice.anyThreeDungeons') },
      { value: 'onePendant', sourceValue: 'onePendant', label: msg('randomizer:storyGate.pedestal.choice.onePendant') },
      { value: 'twoPendants', sourceValue: 'twoPendants', label: msg('randomizer:storyGate.pedestal.choice.twoPendants') },
      { value: 'open', sourceValue: 'open', label: msg('randomizer:storyGate.pedestal.choice.open') },
    ],
    sourceDefault: D.pedestal,
    baseline: D.pedestal,
  },
  {
    ...STORY_GATE_ROW,
    key: K.pedestalScenes,
    displayName: msg('randomizer:storyGate.pedestalScenes.name'),
    kind: 'toggle',
    sourceDefault: D.pedestalScenes,
    baseline: D.pedestalScenes,
  },
  {
    ...STORY_GATE_ROW,
    key: K.sahasrahla,
    displayName: msg('randomizer:storyGate.sahasrahla.name'),
    kind: 'choice',
    choices: [
      { value: 'pendant', sourceValue: 'pendant', label: msg('randomizer:storyGate.sahasrahla.choice.pendant') },
      { value: 'easternPalace', sourceValue: 'easternPalace', label: msg('randomizer:storyGate.sahasrahla.choice.easternPalace') },
    ],
    sourceDefault: D.sahasrahla,
    baseline: D.sahasrahla,
  },
  {
    ...STORY_GATE_ROW,
    key: K.barrier,
    displayName: msg('randomizer:storyGate.barrier.name'),
    kind: 'choice',
    choices: [
      { value: 'sword', sourceValue: 'sword', label: msg('randomizer:storyGate.barrier.choice.sword') },
      { value: 'pedestal', sourceValue: 'pedestal', label: msg('randomizer:storyGate.barrier.choice.pedestal') },
      { value: 'pendants', sourceValue: 'pendants', label: msg('randomizer:storyGate.barrier.choice.pendants') },
      { value: 'lightWorldDungeons', sourceValue: 'lightWorldDungeons', label: msg('randomizer:storyGate.barrier.choice.lightWorldDungeons') },
    ],
    sourceDefault: D.barrier,
    baseline: D.barrier,
  },
  {
    ...STORY_GATE_ROW,
    key: K.bombShop,
    displayName: msg('randomizer:storyGate.bombShop.name'),
    kind: 'choice',
    choices: [
      { value: 'crystals', sourceValue: 'crystals', label: msg('randomizer:storyGate.bombShop.choice.crystals') },
      { value: 'iceAndMire', sourceValue: 'iceAndMire', label: msg('randomizer:storyGate.bombShop.choice.iceAndMire') },
      { value: 'towerCount', sourceValue: 'towerCount', label: msg('randomizer:storyGate.bombShop.choice.towerCount') },
    ],
    sourceDefault: D.bombShop,
    baseline: D.bombShop,
  },
  {
    ...STORY_GATE_ROW,
    key: K.bombShopAsksSmiths,
    displayName: msg('randomizer:storyGate.bombShopAsksSmiths.name'),
    kind: 'toggle',
    sourceDefault: D.bombShopAsksSmiths,
    baseline: D.bombShopAsksSmiths,
  },
  {
    ...STORY_GATE_ROW,
    key: K.towerKind,
    displayName: msg('randomizer:storyGate.towerKind.name'),
    kind: 'choice',
    choices: COUNT_KIND_CHOICES,
    sourceDefault: D.tower.kind,
    baseline: D.tower.kind,
  },
  {
    ...STORY_GATE_ROW,
    key: K.towerCount,
    displayName: msg('randomizer:storyGate.towerCount.name'),
    kind: 'range',
    range: { min: 0, max: 7 },
    sourceDefault: D.tower.count,
    baseline: D.tower.count,
  },
  {
    ...STORY_GATE_ROW,
    key: K.ganonKind,
    displayName: msg('randomizer:storyGate.ganonKind.name'),
    kind: 'choice',
    choices: COUNT_KIND_CHOICES,
    sourceDefault: D.ganon.kind,
    baseline: D.ganon.kind,
  },
  {
    ...STORY_GATE_ROW,
    key: K.ganonCount,
    displayName: msg('randomizer:storyGate.ganonCount.name'),
    kind: 'range',
    range: { min: 0, max: 7 },
    sourceDefault: D.ganon.count,
    baseline: D.ganon.count,
  },
  {
    ...STORY_GATE_ROW,
    key: K.pyramidHole,
    displayName: msg('randomizer:storyGate.pyramidHole.name'),
    kind: 'choice',
    choices: [
      { value: 'goal', sourceValue: 'goal', label: msg('randomizer:storyGate.pyramidHole.choice.goal') },
      { value: 'open', sourceValue: 'open', label: msg('randomizer:storyGate.pyramidHole.choice.open') },
      { value: 'auto', sourceValue: 'auto', label: msg('randomizer:storyGate.pyramidHole.choice.auto') },
    ],
    sourceDefault: 'goal',
    baseline: 'goal',
  },
  {
    ...STORY_GATE_ROW,
    key: K.heraMusic,
    displayName: msg('randomizer:storyGate.heraMusic.name'),
    kind: 'toggle',
    sourceDefault: D.heraMusic,
    baseline: D.heraMusic,
  },
  {
    ...STORY_GATE_ROW,
    key: K.vaneScene,
    displayName: msg('randomizer:storyGate.vaneScene.name'),
    kind: 'toggle',
    sourceDefault: D.vaneScene,
    baseline: D.vaneScene,
  },
  {
    ...STORY_GATE_ROW,
    key: K.mountainRespawn,
    displayName: msg('randomizer:storyGate.mountainRespawn.name'),
    kind: 'toggle',
    sourceDefault: D.mountainRespawn,
    baseline: D.mountainRespawn,
  },
];

export { STORY_GATE_OPTION_SEEDS };
