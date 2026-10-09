/* @layer shared-game @kind constants */
import { PRICED_ENTRIES } from '../priced-entries';

const TABLE_TARGETS: ReadonlySet<string> = new Set(PRICED_ENTRIES.map((entry) => entry.target));

export { TABLE_TARGETS };
