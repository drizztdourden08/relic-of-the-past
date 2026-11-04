/* @layer renderer-app @kind types */
import type { MessageIdOf, PhysicalPlan, PollEntry, SessionReceiptTexts } from '@rotp/randomizer';

type ArmedParts = {
  plan: PhysicalPlan;
  pollEntries: PollEntry[];
  messageIdOf: MessageIdOf;
  receiptTexts: SessionReceiptTexts;
};

export type { ArmedParts };
