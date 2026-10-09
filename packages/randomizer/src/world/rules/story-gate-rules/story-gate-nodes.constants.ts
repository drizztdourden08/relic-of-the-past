/* @layer shared-game @kind constants */
import { ITEM } from '../../item-ids';
import { TRUE, all, has, hasDistinct, optionSwitch } from '../rule-node-build';
import { ALL_PENDANTS, DARK_WORLD_CRYSTALS, PENDANTS } from './story-gate-items.constants';
import { pendantsNode } from './pendants-node';
import type { RuleNode } from '../rule-node.type';

const ALL_LIGHT_WORLD_DUNGEONS: RuleNode = pendantsNode(ALL_PENDANTS);

const PEDESTAL_NODE: RuleNode = optionSwitch('storyGates.pedestal', [
  ['open', TRUE],
  ['onePendant', pendantsNode(1)],
  ['twoPendants', pendantsNode(2)],
  ['anyThreeDungeons', hasDistinct([...PENDANTS, ...DARK_WORLD_CRYSTALS], 3)],
  ['lightWorldDungeons', ALL_LIGHT_WORLD_DUNGEONS],
], pendantsNode(ALL_PENDANTS));

const ICE_AND_MIRE: RuleNode = all(has(ITEM.crystal5), has(ITEM.crystal6));

export { ALL_LIGHT_WORLD_DUNGEONS, ICE_AND_MIRE, PEDESTAL_NODE };
