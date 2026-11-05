/* @layer renderer-app @kind logic */
import { itemKeyName } from '@rotp/randomizer';
import type { ItemKey } from '@rotp/randomizer';

const rotpItemLabelOf = (item: string): string => itemKeyName(item as ItemKey);

export { rotpItemLabelOf };
