/* @layer shared-game @kind logic */
import type { CheckId, ItemId, Requirement } from '../../../data';
import { evaluateRequirement } from '../../../logic';

const meetsRequirements = (req: Requirement, inv: ReadonlySet<ItemId>, completed: ReadonlySet<CheckId>): boolean =>
  evaluateRequirement(req, inv, completed);

export { meetsRequirements };
