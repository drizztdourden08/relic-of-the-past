/* @layer shared-game @kind logic */
import { INCLUDE_WORLD_ITEMS_KEY } from './scope-option-keys.constants';
import type { OptionValues } from '../options.type';

const includeWorldItemsOf = (values: OptionValues): boolean => values[INCLUDE_WORLD_ITEMS_KEY] === true;

export { includeWorldItemsOf };
