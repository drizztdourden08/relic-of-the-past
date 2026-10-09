/* @layer bridge-wasm @kind types */
import type { LocationKey } from '../world/location-key';
import type { MessageIdOf } from './apply-overrides/apply-overrides.type';
import type { ForeignItemOf } from './foreign-item-line';
import type { ForeignIconIdOf } from './foreign-icon-plan';
import type { PollEntry } from './location-poller/location-poller.type';
import type { PhysicalPlan } from './physical-plan.type';
import type { SessionReceiptTexts } from './receipt-text-refresh.type';

interface SessionStartHooks {
  reporter: { reportCheck(location: LocationKey): void };
  foreignItemOf?: ForeignItemOf;
  foreignIconIdOf?: ForeignIconIdOf;
}

type SessionArmResult =
  | { ok: false; plan: PhysicalPlan }
  | { ok: true; plan: PhysicalPlan; receiptTexts: SessionReceiptTexts; messageIdOf: MessageIdOf; pollEntries: PollEntry[] };

export type { SessionArmResult, SessionStartHooks };
