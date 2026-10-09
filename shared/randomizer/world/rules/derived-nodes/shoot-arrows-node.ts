/* @layer shared-game @kind logic */
import { ITEM } from '../../item-ids.data';
import { all, any, has, helper, option, when } from '../rule-node-build';
import { MIN_ARROWS_ASKED } from './derived-nodes.constants';
import { retroQuiverNode } from './retro-quiver-node';
import type { RuleNode } from '../rule-node.type';

const shootArrowsNode = (count: number): RuleNode => all(
  any(has(ITEM.bow), has(ITEM.silverBow)),
  when(option('retroBow.enabled', true), retroQuiverNode(), helper('projectilesAtLeast', Math.max(MIN_ARROWS_ASKED, count))),
);

export { shootArrowsNode };
