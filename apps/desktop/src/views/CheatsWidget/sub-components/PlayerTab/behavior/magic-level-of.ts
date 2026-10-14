/* @layer renderer-widgets @kind logic */
import { MAGIC_LEVELS, MAGIC_UNITS_PER_LEVEL } from '../PlayerTab.constants';

const magicLevelOf = (units: number): number => Math.min(MAGIC_LEVELS, Math.max(0, (units + MAGIC_UNITS_PER_LEVEL - 1) >> 3));

export { magicLevelOf };
