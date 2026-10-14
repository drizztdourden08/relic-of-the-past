/* @layer renderer-widgets @kind logic */
import { MAGIC_LEVELS } from '../PlayerTab.constants';

const magicPercentOf = (level: number): string => `${Math.round((level / MAGIC_LEVELS) * 100)}%`;

export { magicPercentOf };
