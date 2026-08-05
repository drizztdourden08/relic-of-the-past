/* @layer renderer-app @kind data */
/**
 * Why this override exists, and it is the one genuine misinference in the
 * dataset: only twelve of the 174 rows carry a `vanillaName` at all, so the
 * observed set is small enough that derivation reads it as a closed `enum` and
 * offers a dropdown of the twelve. A name is free text however few of them
 * happen to be filled in, which is exactly what `kinds` is for — the derived
 * base is otherwise untouched.
 *
 * The column set is the second reason: eleven top-level fields, two of them
 * nested shapes that say nothing in a cell.
 */
import type { SchemaConfig } from '@ds/data';

const ITEM_CONFIG: SchemaConfig = {
  kinds: { vanillaName: 'string' },
  defaultColumns: ['id', 'randomizerName', 'vanillaName', 'category', 'origin', 'tier'],
  // Same hex convention as SCREEN_CONFIG — a native Link_ReceiveItem index byte.
  formats: { 'gameId.receiveItemId': 'hex2' },
};

export { ITEM_CONFIG };
