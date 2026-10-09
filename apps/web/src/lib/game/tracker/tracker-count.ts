/* @layer bridge-wasm @kind logic */
import type { CheckRecord } from '@shared/game/data';

const isCountedCheck = (check: CheckRecord): boolean =>
  check.kind !== 'event' && check.statusOnly !== true;

export { isCountedCheck };
