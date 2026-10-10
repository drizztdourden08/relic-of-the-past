/* @layer bridge-wasm @kind logic */
import { capacityRungLinesOf, capacityFixedLinesOf, NO_RUNG_LINES } from '@rotp/randomizer';
import { setSessionReceiptMessages } from '../session-dialogue';
import type { CapacityFamilyId, CapacityProfile, CapacityLineMessages, RungMessageIdOf } from '@rotp/randomizer';
import { itemAt } from '@app/checked-access';
import type { CapacityFixedLineArm } from '../capacity-fixed-lines';

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
  return entries.map(({ family, fromRung, jump }, index) => ({ family, fromRung, jump, messageId: itemAt(ids, index) }));
};

const composeCapacityLineMessages = (profile: CapacityProfile, progressive: boolean): CapacityLineMessages =>
  (progressive
    ? { rungMessageIdOf: composeRungMessages(profile), fixedLineMessages: [] }
    : { rungMessageIdOf: NO_RUNG_LINES, fixedLineMessages: composeFixedMessages(profile) });

export { composeCapacityLineMessages };
export type { CapacityLineMessages, RungMessageIdOf } from '@rotp/randomizer';
