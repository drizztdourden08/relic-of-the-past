/* @layer shared-game @kind logic */
import type { IdRange } from './upgrade-receive-id.type';

const isWithinRange = (id: number, range: IdRange): boolean => id >= range.first && id <= range.last;

export { isWithinRange };
