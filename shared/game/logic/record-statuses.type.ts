/* @layer shared-game @kind types */
import type { CheckId, CheckRecord, ItemId, Requirement } from '../data';

interface RecordStatusParams {
  inventory: ReadonlySet<ItemId>;
  completedChecks: ReadonlySet<CheckId>;
  checks: readonly CheckRecord[];
  reachableScreens: ReadonlySet<string>;
  checkOverrides?: Partial<Record<CheckId, Requirement>>;
}

export type { RecordStatusParams };
