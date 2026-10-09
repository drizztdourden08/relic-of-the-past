/* @layer shared-game @kind logic */
import type { ItemId } from '../../../data';
import type { ShownItemsParams } from './check-contents.type';
import { shownItemsOf } from './shown-items-of';

const shownItemOf = (params: ShownItemsParams): ItemId | undefined =>
  shownItemsOf({ ...params, expand: false })[0];

export { shownItemOf };
