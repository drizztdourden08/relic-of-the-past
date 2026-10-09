/* @layer shared-game @kind types */
import type { CheckRecord, ItemId } from '../../../data';
import type { RunContext } from '../check-grouping/check-grouping.type';

interface ShownItemsParams {
  check: CheckRecord;
  run?: RunContext;
  override?: ItemId;
  receipt?: ItemId;
  expand?: boolean;
}

export type { ShownItemsParams };
