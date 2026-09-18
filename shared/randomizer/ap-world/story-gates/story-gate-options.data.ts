/* @layer shared-game @kind data */
/**
 * The story gate rows of the option catalog: synthetic, unlocked, group 'goal'. Every
 * baseline is the story as the game tells it. The three the reference already asks
 * (crystals for the tower, crystals for Ganon, the pyramid hole) keep its keys and
 * replace its locked rows.
 */
import { DEFAULT_STORY_GATES as D } from './story-gates.data';
import { STORY_GATE_KEY as K } from './story-gate-option-keys';
import type { ApOptionChoice, ApOptionDef } from '../options.type';

type Seed = Omit<ApOptionDef, 'description'>;

const base = { group: 'goal' as const, implementation: 'active' as const, locked: false, synthetic: true };

const choice = (value: string, label: string): ApOptionChoice => ({ value, apValue: value, label });
const toggle = (key: string, displayName: string, baseline: boolean): Seed =>
  ({ ...base, key, displayName, kind: 'toggle', apDefault: baseline, baseline });
const pick = (key: string, displayName: string, choices: readonly ApOptionChoice[], baseline: string): Seed =>
  ({ ...base, key, displayName, kind: 'choice', choices, apDefault: baseline, baseline });
const count = (key: string, displayName: string, baseline: number): Seed =>
  ({ ...base, key, displayName, kind: 'range', range: { min: 0, max: 7 }, apDefault: baseline, baseline });

const COUNT_KIND_CHOICES: readonly ApOptionChoice[] = [
  choice('crystals', 'Crystals held'),
  choice('darkWorldDungeons', 'Dark World dungeons cleared'),
];

const STORY_GATE_OPTION_SEEDS: readonly Seed[] = [
  pick(K.pedestal, 'Master Sword pedestal opens with', [
    choice('pendants', 'All pendants held'),
    choice('lightWorldDungeons', 'Light World dungeons cleared'),
    choice('anyThreeDungeons', 'Any three dungeons cleared'),
    choice('onePendant', 'One pendant held'),
    choice('twoPendants', 'Two pendants held'),
    choice('open', 'Always open'),
  ], D.pedestal),
  toggle(K.pedestalScenes, 'Scenes follow the pedestal, never the sword', D.pedestalScenes),
  pick(K.sahasrahla, 'Sahasrahla gives his gift for', [
    choice('pendant', 'The Pendant of Courage'),
    choice('easternPalace', 'Eastern Palace cleared'),
  ], D.sahasrahla),
  pick(K.bombShop, 'Big Bomb goes on sale after', [
    choice('crystals', 'Crystals 5 and 6'),
    choice('iceAndMire', 'Ice Palace and Misery Mire cleared'),
    choice('towerCount', 'The tower count'),
  ], D.bombShop),
  toggle(K.bombShopAsksSmiths, 'Big Bomb also needs the Smiths reunited', D.bombShopAsksSmiths),
  pick(K.towerKind, "Ganon's Tower counts", COUNT_KIND_CHOICES, D.tower.kind),
  count(K.towerCount, "Ganon's Tower needs", D.tower.count),
  pick(K.ganonKind, 'Ganon takes damage counting', COUNT_KIND_CHOICES, D.ganon.kind),
  count(K.ganonCount, 'Ganon takes damage after', D.ganon.count),
  pick(K.pyramidHole, 'Pyramid hole opens', [
    choice('goal', 'After Agahnim 2'),
    choice('open', 'From the start'),
    choice('auto', 'With the tower count'),
  ], 'goal'),
  toggle(K.heraMusic, 'Tower of Hera music follows Moldorm', D.heraMusic),
  toggle(K.vaneScene, 'Weathervane and Stumpy follow the weathervane', D.vaneScene),
  toggle(K.mountainRespawn, 'Death Mountain respawn follows the Old Man', D.mountainRespawn),
];

export { STORY_GATE_OPTION_SEEDS };
