/* @layer shared-game @kind logic */
import { RETRO_QUIVER_ITEM } from '../../retro/retro-bow.data';
import { retroQuiverRegions } from '../../retro/retro-shops';
import { all, any, has, helper, option, optionRef, region, when } from '../rule-node-build';
import type { RuleNode } from '../rule-node.type';

const retroQuiverNode = (): RuleNode => when(
  option('retroBow.quiverInPool', true),
  all(has(RETRO_QUIVER_ITEM), helper('walletAtLeast', optionRef('retroBow.shotWalletNeed'))),
  all(any(...retroQuiverRegions().map(region)), helper('walletAtLeast', optionRef('retroBow.walletNeed'))),
);

export { retroQuiverNode };
