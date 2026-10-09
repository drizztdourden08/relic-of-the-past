/* @layer shared-game @kind logic */
import type { CheckId, ItemId, Requirement } from '@rotp/game-data';
import { evaluateRequirement } from '@rotp/game-data';

const meetsRequirements = (req: Requirement, inv: ReadonlySet<ItemId>, completed: ReadonlySet<CheckId>): boolean =>
  evaluateRequirement(req, inv, completed);

export { meetsRequirements };
