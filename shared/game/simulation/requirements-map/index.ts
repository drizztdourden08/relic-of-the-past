/* @layer shared-game @kind barrel */
export { ITEM_TO_TOKEN, BARRIER_TO_TOKEN } from '@rotp/game-data';
export { inventoryToReachTokens } from './inventory-to-reach-tokens';
export { tokensForItem } from './tokens-for-item';
export { barrierTagsToRequirements } from './barrier-tags-to-requirements';
export { requirementsMet } from './requirements-met';
export { affectsTraversal } from './affects-traversal';
export { itemAffectsTraversal } from './item-affects-traversal';
export type { ReachContext } from './requirements-map.type';
