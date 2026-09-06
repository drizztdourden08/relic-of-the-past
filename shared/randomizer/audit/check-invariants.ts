/* @layer shared-game @kind logic */
/**
 * Mechanical-invariant audit over the check dataset: composes every rule
 * module into one pure pass. Findings are returned, never thrown: this feeds
 * the data-certification pipeline's discovery run.
 */
import { checkShapes } from './invariant-shape';
import { checkUniqueBits } from './invariant-unique';
import { checkDungeonRefs, checkItemRefs } from './invariant-refs';
import { checkNames, checkSourceFuncs } from './invariant-names';
import type { InvariantFinding, InvariantInput } from './invariant-types';

const RULES = [checkShapes, checkUniqueBits, checkItemRefs, checkDungeonRefs, checkNames, checkSourceFuncs] as const;

const runCheckInvariants = (input: InvariantInput): InvariantFinding[] =>
  RULES.flatMap((rule) => rule(input));

export { runCheckInvariants };
export type { InvariantFinding, InvariantInput };
