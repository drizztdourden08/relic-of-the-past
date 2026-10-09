/* @layer shared-game @kind data */
import type { TraversalRequirement } from '../../../pathfinding/nav-data.types';
import type { ConnectionTag } from '../../taxonomy/connection-tags.generated.type';
import type { ItemId } from '../../types/ids';

const ITEM_TO_TOKEN: Partial<Record<ItemId, TraversalRequirement>> = {
  'item-041': 'bombs',
  'item-028': 'lift.2',
  'item-029': 'lift.3',
  'item-010': 'hammer',
  'item-076': 'boots',
  'item-031': 'flippers',
  'item-011': 'hookshot',
  'item-027': 'mirror',
  'item-032': 'moonpearl',
  'item-021': 'flute',
  'item-075': 'flute',
  'item-026': 'cape',
  'item-025': 'byrna',
  'item-022': 'somaria',
  'item-012': 'bow',
  'item-059': 'bow',
  'item-060': 'bow',
  'item-008': 'firerod',
  'item-009': 'icerod',
  'item-019': 'lamp',
  'item-016': 'bombos',
  'item-017': 'ether',
  'item-018': 'quake',
  'item-030': 'book',
  'item-020': 'shovel',
  'item-034': 'net',
  'item-023': 'bottle',
};

const IMPLIED_TOKENS: Partial<Record<TraversalRequirement, readonly TraversalRequirement[]>> = {
  'lift.3': ['lift.2', 'lift.1'],
  'lift.2': ['lift.1'],
};

const BARRIER_TO_TOKEN: Partial<Record<ConnectionTag, TraversalRequirement>> = {
  'barrier:gloves': 'lift.2',
  'barrier:hammer': 'hammer',
  'barrier:dash': 'boots',
  'barrier:hookshot': 'hookshot',
  'barrier:swim': 'flippers',
  'barrier:fire': 'firerod',
  'barrier:book': 'book',
  'barrier:dark': 'lamp',
  'barrier:bomb': 'bombs',
  'barrier:medallion': 'event:unmapped-barrier-medallion',
  'barrier:crystals': 'event:unmapped-barrier-crystals',
  'barrier:event': 'event:unmapped-barrier-event',
  'barrier:glitch': 'event:unmapped-barrier-glitch',
};

export { ITEM_TO_TOKEN, IMPLIED_TOKENS, BARRIER_TO_TOKEN };
