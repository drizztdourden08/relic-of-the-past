/* @layer shared-game @kind logic */
import { CRYSTAL_ITEMS } from '../../item-groups';
import { countGroup, hasDistinct, option, optionRef, when } from '../rule-node-build';
import { DARK_WORLD_CRYSTALS } from './story-gate-items.constants';
import type { RuleNode } from '../rule-node.type';

const countGateNode = (gate: 'tower' | 'ganon'): RuleNode => when(
  option(`storyGates.${gate}.kind`, 'darkWorldDungeons'),
  hasDistinct(DARK_WORLD_CRYSTALS, optionRef(`storyGates.${gate}.count`)),
  countGroup(CRYSTAL_ITEMS, optionRef(`storyGates.${gate}.crystals`)),
);

export { countGateNode };
