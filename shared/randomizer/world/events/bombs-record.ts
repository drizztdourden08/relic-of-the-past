/* @layer shared-game @kind logic */
/**
 * Whether a bomb was ever in the player's hands, from the game's own record.
 *
 * Bombs are the one thing the capacity ladder cannot answer for. The carry limit stands above
 * zero from the first frame, so a rule reading the ladder alone believes a bomb is always in
 * hand, and everything behind a cracked wall reads as open before the player owns a single one.
 * The ledger keeps the fact the game itself keeps, and the tracker hands it over as a token
 * beside the other acts.
 *
 * The split is the same one the rest of this folder makes: a world with a record attached
 * answers from the record, and a world without one, which is every fill, keeps the capacity
 * reading on its own. So a seed still treats a bomb as farmable and nothing over-constrains
 * against the reference.
 */
import type { CheckId } from '@shared/game/data/types/ids';
import type { CollectionState } from '../collection-state';

/**
 * The token the record grants: the ledger's own bomb bit, which is a check of the dataset like
 * any other act, and the row that joins the two is in event-gates.data.ts.
 */
const BOMBS_HELD_CHECK: CheckId = 'check-511';

/** No record attached means the question cannot be asked, so the capacity reading stands alone. */
const bombsEverHeld = (state: CollectionState): boolean =>
  state.world.options.actTokens === undefined || state.has(BOMBS_HELD_CHECK);

export { BOMBS_HELD_CHECK, bombsEverHeld };
