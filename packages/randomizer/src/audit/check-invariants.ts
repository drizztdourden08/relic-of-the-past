/* @layer shared-game @kind logic */
import { INVARIANT_RULES } from './check-invariants.constants';
import type { InvariantFinding, InvariantInput } from './invariant.type';

const runCheckInvariants = (input: InvariantInput): InvariantFinding[] =>
  INVARIANT_RULES.flatMap((rule) => rule(input));

export { runCheckInvariants };
