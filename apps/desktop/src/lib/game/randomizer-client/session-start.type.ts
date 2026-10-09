/* @layer bridge-wasm @kind types */
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { MessageIdOf } from './apply-overrides';
import type { ForeignItemOf } from './foreign-item-line';
import type { ForeignIconIdOf } from './foreign-icon-plan';
import type { PollEntry } from './location-poller';
import type { PhysicalPlan } from './physical-plan.type';
import type { SessionReceiptTexts } from './receipt-text-refresh';

interface SessionStartHooks {
  reporter: { reportCheck(location: LocationKey): void };
  foreignItemOf?: ForeignItemOf;
  foreignIconIdOf?: ForeignIconIdOf;
}

type SessionArmResult =
  | { ok: false; plan: PhysicalPlan }
  | { ok: true; plan: PhysicalPlan; receiptTexts: SessionReceiptTexts; messageIdOf: MessageIdOf; pollEntries: PollEntry[] };

export type { SessionArmResult, SessionStartHooks };
