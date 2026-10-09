/* @layer shared-game @kind constants */
import { PRICED_ENTRIES } from '../priced-entries';

const TABLE_PRICE: ReadonlyMap<string, number> = new Map(
  PRICED_ENTRIES.filter((entry) => entry.kind === 'location').map((entry) => [entry.target, entry.price]),
);

export { TABLE_PRICE };
