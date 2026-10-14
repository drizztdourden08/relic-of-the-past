/* @layer renderer-widgets @kind logic */
import { BOTTLE_SLOT_INDEX } from '../ItemsTab.constants';

const shownValueOf = (slot: number, value: number, bottles: readonly number[]): number =>
  (slot === BOTTLE_SLOT_INDEX ? (bottles[value - 1] ?? 0) : value);

export { shownValueOf };
