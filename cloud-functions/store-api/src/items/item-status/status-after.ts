/* @layer store-api @kind logic */
import type { ItemStatus } from '@rotp/hub-contracts';
import { baseStatus } from './base-status';
import type { StatusInput } from './item-status.type';

const statusAfter = (item: StatusInput): ItemStatus => (item.status === 'unlisted' ? 'unlisted' : baseStatus(item));

export { statusAfter };
