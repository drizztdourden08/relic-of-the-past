/* @layer bridge-wasm @kind logic */
import { getCheck } from '@rotp/game-data';
import type { CheckId } from '@rotp/game-data';
import { FREESTANDING_KEY_BY_CHECK } from './freestanding-key-drops.constants';
import type { FreestandingKeyDrop } from './freestanding-key-drops.type';

const throwOnUnknownCheck = (checkId: CheckId): void => {
  getCheck(checkId);
};

const freestandingKeyDropOf = (checkId: CheckId): FreestandingKeyDrop | null => {
  const target = FREESTANDING_KEY_BY_CHECK.get(checkId);
  if (target === undefined) return null;
  throwOnUnknownCheck(checkId);
  return target;
};

export { freestandingKeyDropOf };
export type { FreestandingKeyDrop } from './freestanding-key-drops.type';
