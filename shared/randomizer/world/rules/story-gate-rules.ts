/* @layer shared-game @kind logic */
/**
 * The rules the story gates decide, read from the world's own settings at evaluation time.
 *
 * Each gate's default is the story as the game tells it, so a world that carries no setting
 * answers exactly as the hardcoded rows did before these existed. The gate says what a moment
 * ASKS FOR; what the moment then opens is the event's own business.
 *
 * Every gate is a tree over the setting readings of rule-options.ts: a `switch` over the gate's
 * value, the count gates reading their number straight off the setting.
 */
import { ITEM } from '../item-ids.data';
import { CRYSTAL_ITEMS } from '../item-groups';
import { compileRule } from './rule-eval';
import {
  FALSE, TRUE, all, countGroup, has, hasDistinct, option, optionRef, optionSwitch, when,
} from './rule-node-build';
import type { ItemId } from '@shared/game/data/types/ids';
import type { RuleNode } from './rule-node.type';

const PENDANTS: readonly ItemId[] = [ITEM.redPendant, ITEM.bluePendant, ITEM.greenPendant];
/** The dark world's seven dungeons, by the crystal each one hands over. */
const DARK_WORLD_CRYSTALS: readonly ItemId[] = CRYSTAL_ITEMS;

/** At least `count` of the three pendants in hand. */
const pendants = (count: number): RuleNode => hasDistinct(PENDANTS, count);

/** Every Light World dungeon cleared, which the pendants stand for. */
const allLightWorldDungeons = pendants(3);

/**
 * A count gate. Dark World dungeons count the crystals held one by one; the crystal kind counts
 * them raw, zero meaning the original seven (the 'crystals' reading already says so).
 */
const countGate = (gate: 'tower' | 'ganon'): RuleNode => when(
  option(`storyGates.${gate}.kind`, 'darkWorldDungeons'),
  hasDistinct(DARK_WORLD_CRYSTALS, optionRef(`storyGates.${gate}.count`)),
  countGroup(CRYSTAL_ITEMS, optionRef(`storyGates.${gate}.crystals`)),
);

const pedestalNode = optionSwitch('storyGates.pedestal', [
  ['open', TRUE],
  ['onePendant', pendants(1)],
  ['twoPendants', pendants(2)],
  ['anyThreeDungeons', hasDistinct([...PENDANTS, ...DARK_WORLD_CRYSTALS], 3)],
  ['lightWorldDungeons', allLightWorldDungeons],
], pendants(3));

const iceAndMire = all(has(ITEM.crystal5), has(ITEM.crystal6));

const pedestalRule = compileRule(pedestalNode);

const sahasrahlaRule = compileRule(when(
  option('storyGates.sahasrahla', 'easternPalace'), has(ITEM.crystal1), has(ITEM.greenPendant),
));

/** What the castle barrier falls to, beyond the routes that always pass it. */
const barrierRule = compileRule(optionSwitch('storyGates.barrier', [
  ['pedestal', pedestalNode],
  ['pendants', pendants(3)],
  ['lightWorldDungeons', allLightWorldDungeons],
], FALSE));

/** Whether the Bomb Shop has put the Big Bomb on sale. */
const bombShopRule = compileRule(optionSwitch('storyGates.bombShop', [
  ['iceAndMire', iceAndMire],
  ['towerCount', countGate('tower')],
], iceAndMire));

const towerRule = compileRule(countGate('tower'));
const ganonRule = compileRule(countGate('ganon'));

const pyramidHoleRule = compileRule(optionSwitch('storyGates.pyramidHole', [
  ['open', TRUE],
  ['towerCount', countGate('tower')],
], has(ITEM.beatAgahnim2)));

export {
  barrierRule, bombShopRule, ganonRule, pedestalRule, pyramidHoleRule, sahasrahlaRule, towerRule,
};
