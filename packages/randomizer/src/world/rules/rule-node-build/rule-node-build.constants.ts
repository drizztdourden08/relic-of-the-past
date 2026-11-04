/* @layer shared-game @kind constants */
import {
  all as allNode, any as anyNode, countGroup as countGroupNode, has as hasNode, hasAny as hasAnyNode,
  hasDistinct as hasDistinctNode, helper as helperNode, option as optionNode, optionRef as optionRefNode,
  optionSwitch as optionSwitchNode, region as regionNode, seedIs as seedIsNode, when as whenNode,
} from '@drizztdourden08/brock-randomizer/world';
import type { RotpKeys } from '../../rotp-keys.type';

const all = allNode<RotpKeys>;

const any = anyNode<RotpKeys>;

const countGroup = countGroupNode<RotpKeys>;

const has = hasNode<RotpKeys>;

const hasAny = hasAnyNode<RotpKeys>;

const hasDistinct = hasDistinctNode<RotpKeys>;

const helper = helperNode<RotpKeys>;

const option = optionNode<RotpKeys>;

const optionRef = optionRefNode<RotpKeys>;

const optionSwitch = optionSwitchNode<RotpKeys>;

const region = regionNode<RotpKeys>;

const seedIs = seedIsNode<RotpKeys>;

const when = whenNode<RotpKeys>;

export {
  all, any, countGroup, has, hasAny, hasDistinct, helper, option, optionRef, optionSwitch, region, seedIs, when,
};
