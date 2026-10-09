/* @layer bridge-wasm @kind logic */
import { getItem } from '@shared/game/data';
import type { CheckRecord } from '@shared/game/data';
import { FALLBACK_VANILLA_LABEL } from './cheat-check-grant.constants';

const vanillaItemLabelOf = (check: CheckRecord): string => {
  const itemId = check.vanillaItemIds[0];
  return itemId ? getItem(itemId).name : FALLBACK_VANILLA_LABEL;
};

export { vanillaItemLabelOf };
