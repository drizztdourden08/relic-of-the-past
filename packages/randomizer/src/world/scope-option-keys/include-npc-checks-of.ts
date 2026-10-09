/* @layer shared-game @kind logic */
import { INCLUDE_NPC_CHECKS_KEY } from './scope-option-keys.constants';
import type { OptionValues } from '../options.type';

const includeNpcChecksOf = (values: OptionValues): boolean => values[INCLUDE_NPC_CHECKS_KEY] === true;

export { includeNpcChecksOf };
