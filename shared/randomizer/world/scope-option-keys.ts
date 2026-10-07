/* @layer shared-game @kind logic */
/**
 * The two scope switches of the option catalog, and the one reading of each
 * off a snapshot's values. Every consumer that asks whether a scope is
 * shuffled asks it here.
 */
import type { OptionValue } from './options.type';

type Values = Readonly<Record<string, OptionValue>>;

const INCLUDE_NPC_CHECKS_KEY = 'include_npc_checks';
const INCLUDE_WORLD_ITEMS_KEY = 'include_world_items';

const includeNpcChecksOf = (values: Values): boolean => values[INCLUDE_NPC_CHECKS_KEY] === true;

const includeWorldItemsOf = (values: Values): boolean => values[INCLUDE_WORLD_ITEMS_KEY] === true;

export { INCLUDE_NPC_CHECKS_KEY, INCLUDE_WORLD_ITEMS_KEY, includeNpcChecksOf, includeWorldItemsOf };
