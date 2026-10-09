/* @layer shared-game @kind logic */
import { ITEM } from '../../item-ids.data';
import { BOTTLE_ITEMS } from '../../item-groups';
import { REGION } from '../../region-ids.data';
import { FALSE, all, any, countGroup, has, helper, region } from '../rule-node-build';
import type { World } from '../../world.type';
import type { RuleNode } from '../rule-node.type';

const goodBeeNode = (world: World): RuleNode => {
  const cave = world.regions.get(REGION.coldBeeCave);
  if (cave === undefined) return FALSE;
  return all(
    countGroup(BOTTLE_ITEMS, 1),
    has(ITEM.bugCatchingNet),
    any(has(ITEM.pegasusBoots), all(helper('hasSword'), has(ITEM.quake))),
    region(cave.id),
    ...(cave.isLightWorld ? [] : [has(ITEM.moonPearl)]),
  );
};

export { goodBeeNode };
