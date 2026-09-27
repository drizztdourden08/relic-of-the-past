/* @layer shared-game @kind logic */
/**
 * The rules the story gates decide, read from the world's own settings at evaluation time.
 *
 * Each gate's default is the story as the game tells it, so a world that carries no setting
 * answers exactly as the hardcoded rows did before these existed. The gate says what a moment
 * ASKS FOR; what the moment then opens is the event's own business.
 */
import { ITEM } from '../item-ids.data';
import { CRYSTAL_ITEMS } from '../item-groups';
import { hasCrystals } from '../state-helpers-world';
import { DEFAULT_STORY_GATES } from '../story-gates/story-gates.data';
import type { CollectionState } from '../collection-state';
import type { CountGate, StoryGateSetting } from '../story-gates/story-gate.type';
import type { ItemId } from '@shared/game/data/types/ids';
import type { Rule } from '../world.type';

const PENDANTS: readonly ItemId[] = [ITEM.redPendant, ITEM.bluePendant, ITEM.greenPendant];
/** The dark world's seven dungeons, by the crystal each one hands over. */
const DARK_WORLD_CRYSTALS: readonly ItemId[] = CRYSTAL_ITEMS;

const gatesOf = (state: CollectionState): StoryGateSetting => state.world.options.storyGates ?? DEFAULT_STORY_GATES;

const pendantCount = (state: CollectionState): number => PENDANTS.filter((name) => state.has(name)).length;
const clearedDarkWorldDungeons = (state: CollectionState): number =>
  DARK_WORLD_CRYSTALS.filter((name) => state.has(name)).length;

/** A count gate. Zero with the crystal kind means the original number, seven. */
const meetsCount = (state: CollectionState, gate: CountGate): boolean => {
  if (gate.kind === 'darkWorldDungeons') return clearedDarkWorldDungeons(state) >= gate.count;
  return hasCrystals(state, gate.count === 0 ? 7 : gate.count);
};

/** Every Light World dungeon cleared, which the pendants stand for. */
const allLightWorldDungeons = (state: CollectionState): boolean => pendantCount(state) >= 3;

const pedestalRule: Rule = (state) => {
  switch (gatesOf(state).pedestal) {
    case 'open': return true;
    case 'onePendant': return pendantCount(state) >= 1;
    case 'twoPendants': return pendantCount(state) >= 2;
    case 'anyThreeDungeons': return pendantCount(state) + clearedDarkWorldDungeons(state) >= 3;
    case 'lightWorldDungeons': return allLightWorldDungeons(state);
    default: return pendantCount(state) >= 3;
  }
};

const sahasrahlaRule: Rule = (state) =>
  (gatesOf(state).sahasrahla === 'easternPalace' ? state.has(ITEM.crystal1) : state.has(ITEM.greenPendant));

/** What the castle barrier falls to, beyond the routes that always pass it. */
const barrierRule: Rule = (state) => {
  switch (gatesOf(state).barrier) {
    case 'pedestal': return pedestalRule(state);
    case 'pendants': return pendantCount(state) >= 3;
    case 'lightWorldDungeons': return allLightWorldDungeons(state);
    default: return false;
  }
};

/** Whether the Bomb Shop has put the Big Bomb on sale. */
const bombShopRule: Rule = (state) => {
  const gates = gatesOf(state);
  switch (gates.bombShop) {
    case 'iceAndMire': return state.has(ITEM.crystal5) && state.has(ITEM.crystal6);
    case 'towerCount': return meetsCount(state, gates.tower);
    default: return state.has(ITEM.crystal5) && state.has(ITEM.crystal6);
  }
};

const towerRule: Rule = (state) => meetsCount(state, gatesOf(state).tower);
const ganonRule: Rule = (state) => meetsCount(state, gatesOf(state).ganon);

const pyramidHoleRule: Rule = (state) => {
  const gates = gatesOf(state);
  switch (gates.pyramidHole) {
    case 'open': return true;
    case 'towerCount': return meetsCount(state, gates.tower);
    default: return state.has(ITEM.beatAgahnim2);
  }
};

export {
  barrierRule, bombShopRule, ganonRule, pedestalRule, pyramidHoleRule, sahasrahlaRule, towerRule,
};
