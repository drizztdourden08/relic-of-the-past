/* @layer shared-game @kind constants */
import { ITEM } from '../../item-ids.data';
import { STORY_EVENT } from '../../events/story-events.data';
import { compileRule } from '../rule-eval';
import { FALSE, TRUE, has, option, optionSwitch, when } from '../rule-node-build';
import { ALL_PENDANTS } from './story-gate-items.constants';
import { ALL_LIGHT_WORLD_DUNGEONS, ICE_AND_MIRE, PEDESTAL_NODE } from './story-gate-nodes.constants';
import { countGateNode } from './count-gate-node';
import { pendantsNode } from './pendants-node';

const pedestalRule = compileRule(PEDESTAL_NODE);

const sahasrahlaRule = compileRule(when(
  option('storyGates.sahasrahla', 'easternPalace'), has(ITEM.crystal1), has(ITEM.greenPendant),
));

const barrierRule = compileRule(optionSwitch('storyGates.barrier', [
  ['pedestal', PEDESTAL_NODE],
  ['pendants', pendantsNode(ALL_PENDANTS)],
  ['lightWorldDungeons', ALL_LIGHT_WORLD_DUNGEONS],
], FALSE));

const bombShopRule = compileRule(optionSwitch('storyGates.bombShop', [
  ['iceAndMire', ICE_AND_MIRE],
  ['towerCount', countGateNode('tower')],
], ICE_AND_MIRE));

const towerRule = compileRule(countGateNode('tower'));

const ganonRule = compileRule(countGateNode('ganon'));

const pyramidHoleRule = compileRule(optionSwitch('storyGates.pyramidHole', [
  ['open', TRUE],
  ['towerCount', countGateNode('tower')],
], has(STORY_EVENT.agahnim2Beaten)));

export {
  barrierRule, bombShopRule, ganonRule, pedestalRule, pyramidHoleRule, sahasrahlaRule, towerRule,
};
