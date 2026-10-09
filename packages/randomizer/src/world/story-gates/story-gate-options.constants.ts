/* @layer shared-game @kind data */
import { DEFAULT_STORY_GATES as D } from './story-gates.constants';
import { STORY_GATE_KEY as K } from './story-gate-option-keys/story-gate-option-keys.constants';
import type { OptionChoice, OptionSeed } from '../options.type';

const STORY_GATE_ROW = { group: 'goal' as const, implementation: 'active' as const, locked: false, synthetic: true };

const COUNT_KIND_CHOICES: readonly OptionChoice[] = [
  { value: 'crystals', sourceValue: 'crystals', label: 'Crystals held' },
  { value: 'darkWorldDungeons', sourceValue: 'darkWorldDungeons', label: 'Dark World dungeons cleared' },
];

const STORY_GATE_OPTION_SEEDS: readonly OptionSeed[] = [
  {
    ...STORY_GATE_ROW,
    key: K.pedestal,
    displayName: 'Master Sword pedestal opens with',
    kind: 'choice',
    choices: [
      { value: 'pendants', sourceValue: 'pendants', label: 'All pendants held' },
      { value: 'lightWorldDungeons', sourceValue: 'lightWorldDungeons', label: 'Light World dungeons cleared' },
      { value: 'anyThreeDungeons', sourceValue: 'anyThreeDungeons', label: 'Any three dungeons cleared' },
      { value: 'onePendant', sourceValue: 'onePendant', label: 'One pendant held' },
      { value: 'twoPendants', sourceValue: 'twoPendants', label: 'Two pendants held' },
      { value: 'open', sourceValue: 'open', label: 'Always open' },
    ],
    sourceDefault: D.pedestal,
    baseline: D.pedestal,
  },
  {
    ...STORY_GATE_ROW,
    key: K.pedestalScenes,
    displayName: 'Scenes follow the pedestal, never the sword',
    kind: 'toggle',
    sourceDefault: D.pedestalScenes,
    baseline: D.pedestalScenes,
  },
  {
    ...STORY_GATE_ROW,
    key: K.sahasrahla,
    displayName: "Sahasrahla's trial is passed with",
    kind: 'choice',
    choices: [
      { value: 'pendant', sourceValue: 'pendant', label: 'The Pendant of Courage' },
      { value: 'easternPalace', sourceValue: 'easternPalace', label: 'Eastern Palace cleared' },
    ],
    sourceDefault: D.sahasrahla,
    baseline: D.sahasrahla,
  },
  {
    ...STORY_GATE_ROW,
    key: K.barrier,
    displayName: 'Castle barrier falls to',
    kind: 'choice',
    choices: [
      { value: 'sword', sourceValue: 'sword', label: 'A sword that cuts it' },
      { value: 'pedestal', sourceValue: 'pedestal', label: 'Master Sword pulled' },
      { value: 'pendants', sourceValue: 'pendants', label: 'All pendants held' },
      { value: 'lightWorldDungeons', sourceValue: 'lightWorldDungeons', label: 'Light World dungeons cleared' },
    ],
    sourceDefault: D.barrier,
    baseline: D.barrier,
  },
  {
    ...STORY_GATE_ROW,
    key: K.bombShop,
    displayName: 'Big Bomb goes on sale after',
    kind: 'choice',
    choices: [
      { value: 'crystals', sourceValue: 'crystals', label: 'Crystals 5 and 6' },
      { value: 'iceAndMire', sourceValue: 'iceAndMire', label: 'Ice Palace and Misery Mire cleared' },
      { value: 'towerCount', sourceValue: 'towerCount', label: 'The tower count' },
    ],
    sourceDefault: D.bombShop,
    baseline: D.bombShop,
  },
  {
    ...STORY_GATE_ROW,
    key: K.bombShopAsksSmiths,
    displayName: 'Big Bomb also needs the Smiths reunited',
    kind: 'toggle',
    sourceDefault: D.bombShopAsksSmiths,
    baseline: D.bombShopAsksSmiths,
  },
  {
    ...STORY_GATE_ROW,
    key: K.towerKind,
    displayName: "Ganon's Tower counts",
    kind: 'choice',
    choices: COUNT_KIND_CHOICES,
    sourceDefault: D.tower.kind,
    baseline: D.tower.kind,
  },
  {
    ...STORY_GATE_ROW,
    key: K.towerCount,
    displayName: "Ganon's Tower needs",
    kind: 'range',
    range: { min: 0, max: 7 },
    sourceDefault: D.tower.count,
    baseline: D.tower.count,
  },
  {
    ...STORY_GATE_ROW,
    key: K.ganonKind,
    displayName: 'Ganon takes damage counting',
    kind: 'choice',
    choices: COUNT_KIND_CHOICES,
    sourceDefault: D.ganon.kind,
    baseline: D.ganon.kind,
  },
  {
    ...STORY_GATE_ROW,
    key: K.ganonCount,
    displayName: 'Ganon takes damage after',
    kind: 'range',
    range: { min: 0, max: 7 },
    sourceDefault: D.ganon.count,
    baseline: D.ganon.count,
  },
  {
    ...STORY_GATE_ROW,
    key: K.pyramidHole,
    displayName: 'Pyramid hole opens',
    kind: 'choice',
    choices: [
      { value: 'goal', sourceValue: 'goal', label: 'After Agahnim 2' },
      { value: 'open', sourceValue: 'open', label: 'From the start' },
      { value: 'auto', sourceValue: 'auto', label: 'With the tower count' },
    ],
    sourceDefault: 'goal',
    baseline: 'goal',
  },
  {
    ...STORY_GATE_ROW,
    key: K.heraMusic,
    displayName: 'Tower of Hera music follows Moldorm',
    kind: 'toggle',
    sourceDefault: D.heraMusic,
    baseline: D.heraMusic,
  },
  {
    ...STORY_GATE_ROW,
    key: K.vaneScene,
    displayName: 'Weathervane and Stumpy follow the weathervane',
    kind: 'toggle',
    sourceDefault: D.vaneScene,
    baseline: D.vaneScene,
  },
  {
    ...STORY_GATE_ROW,
    key: K.mountainRespawn,
    displayName: 'Death Mountain respawn follows the Old Man',
    kind: 'toggle',
    sourceDefault: D.mountainRespawn,
    baseline: D.mountainRespawn,
  },
];

export { STORY_GATE_OPTION_SEEDS };
