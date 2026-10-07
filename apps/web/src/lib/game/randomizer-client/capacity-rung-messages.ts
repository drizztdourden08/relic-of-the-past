/* @layer bridge-wasm @kind logic */
/**
 * The capacity receipt lines of a session as message ids. A local session
 * folds the lines into its plan texts (receipt-plan-messages); an online
 * session has no plan, so it composes them alone here, as the session
 * dialogue's opening pool. Either way the result is the same lookups the
 * arming hands the core: under a progressive profile family → the message
 * id of each planned rung (undefined when the dialogue could not be
 * composed, the core then shows the family's class line); under a fixed
 * profile the (family, starting rung, jump) entries the core selects by the
 * live rung.
 */

import { capacityRungLinesOf } from '@shared/randomizer/receipt-text/capacity-rung-lines';
import { capacityFixedLinesOf } from '@shared/randomizer/receipt-text/capacity-fixed-lines';
import { setSessionReceiptMessages } from '../session-dialogue';
import type { CapacityFamilyId, CapacityProfile } from '@shared/randomizer/ap-world/capacity';
import type { CapacityFixedLineArm } from '../capacity-fixed-lines';

/** family → its rung lines' message ids in plan order; undefined = no line composed for it. */
type RungMessageIdOf = (family: CapacityFamilyId) => readonly number[] | undefined;

interface CapacityLineMessages {
  rungMessageIdOf: RungMessageIdOf;
  fixedLineMessages: readonly CapacityFixedLineArm[];
}

const NO_RUNG_LINES: RungMessageIdOf = () => undefined;
const NO_CAPACITY_LINES: CapacityLineMessages = { rungMessageIdOf: NO_RUNG_LINES, fixedLineMessages: [] };

const composeRungMessages = (profile: CapacityProfile): RungMessageIdOf => {
  const families = capacityRungLinesOf(profile);
  const ids = setSessionReceiptMessages(families.flatMap((entry) => [...entry.lines]));
  if (ids === null) return NO_RUNG_LINES;
  const byFamily = new Map<CapacityFamilyId, readonly number[]>();
  let next = 0;
  for (const { family, lines } of families) {
    byFamily.set(family, ids.slice(next, next + lines.length));
    next += lines.length;
  }
  return (family) => byFamily.get(family);
};

const composeFixedMessages = (profile: CapacityProfile): readonly CapacityFixedLineArm[] => {
  const entries = capacityFixedLinesOf(profile);
  const ids = setSessionReceiptMessages(entries.map((entry) => entry.line));
  if (ids === null) return [];
  return entries.map(({ family, fromRung, jump }, index) => ({ family, fromRung, jump, messageId: ids[index] }));
};

/** Compose the capacity lines as the session's whole dialogue pool and hand back the lookups. */
const composeCapacityLineMessages = (profile: CapacityProfile, progressive: boolean): CapacityLineMessages =>
  (progressive
    ? { rungMessageIdOf: composeRungMessages(profile), fixedLineMessages: [] }
    : { rungMessageIdOf: NO_RUNG_LINES, fixedLineMessages: composeFixedMessages(profile) });

export { NO_CAPACITY_LINES, NO_RUNG_LINES, composeCapacityLineMessages };
export type { CapacityLineMessages, RungMessageIdOf };
