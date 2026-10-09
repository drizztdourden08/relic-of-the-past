/* @layer bridge-wasm @kind logic */
import { capacityRungLinesOf } from '@shared/randomizer/receipt-text/capacity-rung-lines';
import { capacityFixedLinesOf } from '@shared/randomizer/receipt-text/capacity-fixed-lines';
import { setSessionReceiptMessages } from '../session-dialogue';
import type { CapacityFamilyId, CapacityProfile } from '@shared/randomizer/world/capacity';
import type { CapacityFixedLineArm } from '../capacity-fixed-lines';
import { NO_RUNG_LINES } from './capacity-rung-messages.constants';
import type { CapacityLineMessages, RungMessageIdOf } from './capacity-rung-messages.type';

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

const composeCapacityLineMessages = (profile: CapacityProfile, progressive: boolean): CapacityLineMessages =>
  (progressive
    ? { rungMessageIdOf: composeRungMessages(profile), fixedLineMessages: [] }
    : { rungMessageIdOf: NO_RUNG_LINES, fixedLineMessages: composeFixedMessages(profile) });

export { composeCapacityLineMessages };
export type { CapacityLineMessages, RungMessageIdOf } from './capacity-rung-messages.type';
