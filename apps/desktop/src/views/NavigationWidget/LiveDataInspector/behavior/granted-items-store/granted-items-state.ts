/* @layer renderer-widgets @kind logic */
import type { GrantedItemsState } from '../../LiveDataInspector.type';

const grantedItemsState: GrantedItemsState = {
  granted: new Set<number>(),
  listeners: new Set<() => void>(),
  snapshot: [],
  wired: false,
};

export { grantedItemsState };
