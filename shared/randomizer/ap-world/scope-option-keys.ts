/* @layer shared-game @kind logic */
/**
 * The two scope switches of the option catalog, and the one reading of each
 * off a snapshot's values. Every consumer that asks whether the standing
 * world items are shuffled asks it here, so the legacy fallback is spelled
 * once: a snapshot frozen before the scope split carries no world row at all,
 * and the old synthetic toggle covered the world items too, so an absent
 * world row follows the npc toggle.
 */
import type { ApOptionValue } from './options.type';

type Values = Readonly<Record<string, ApOptionValue>>;

const INCLUDE_NPC_CHECKS_KEY = 'include_npc_checks';
const INCLUDE_WORLD_ITEMS_KEY = 'include_world_items';

const includeNpcChecksOf = (values: Values): boolean => values[INCLUDE_NPC_CHECKS_KEY] === true;

const includeWorldItemsOf = (values: Values): boolean =>
  (values[INCLUDE_WORLD_ITEMS_KEY] ?? includeNpcChecksOf(values)) === true;

export { INCLUDE_NPC_CHECKS_KEY, INCLUDE_WORLD_ITEMS_KEY, includeNpcChecksOf, includeWorldItemsOf };
