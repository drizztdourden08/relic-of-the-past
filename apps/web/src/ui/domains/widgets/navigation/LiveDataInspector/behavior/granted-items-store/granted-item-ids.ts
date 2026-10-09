/* @layer renderer-widgets @kind logic */
import { grantedItemsState } from './granted-items-state';

const grantedItemIds = (): readonly number[] => grantedItemsState.snapshot;

export { grantedItemIds };
