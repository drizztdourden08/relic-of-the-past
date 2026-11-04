/* @layer renderer-app @kind logic */
import type { DeliveryAction, MessageIdOf, PhysicalPlan, PlanEntry, PollEntry, SessionReceiptTexts } from '@rotp/randomizer';
import type { ArmedSeed } from '@drizztdourden08/brock-randomizer/session';
import { reportLocalCheck } from '@app/game/randomizer-client/local-check-report';
import { pollEntriesOfPlan } from './poll-entries-of-plan';

type ArmedParts = {
  plan: PhysicalPlan;
  pollEntries: PollEntry[];
  messageIdOf: MessageIdOf;
  receiptTexts: SessionReceiptTexts;
};

const armedSeedOf = ({ plan, pollEntries, messageIdOf, receiptTexts }: ArmedParts): ArmedSeed<DeliveryAction> => {
  const byLocation = new Map<string, PlanEntry>();
  for (const entry of plan.entries) byLocation.set(entry.location, entry);
  return {
    polled: pollEntriesOfPlan(pollEntries),
    counts: { ...plan.counts },
    onCheck: (key) => reportLocalCheck(key, byLocation.get(key), messageIdOf),
    stop: () => {
      receiptTexts.stop();
      byLocation.clear();
    },
  };
};

export { armedSeedOf };
