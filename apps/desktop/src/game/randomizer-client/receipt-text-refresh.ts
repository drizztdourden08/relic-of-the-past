/* @layer bridge-wasm @kind logic */
import type { LocationKey } from '@rotp/randomizer';
import { receiptCountsOf } from '@rotp/randomizer';
import { receiptLineKey } from '@rotp/randomizer';
import { isForeignItem } from '@rotp/randomizer';
import { log } from '../../log-bus';
import { setSessionReceiptMessages } from '../session-dialogue';
import { getCompletedChecks, onCompletedChecksChanged } from '../tracker';
import { completedLocationKeys } from '@rotp/randomizer';
import { firedLocations, onFiredLocation } from './override-fire-registry';
import { buildPlanReceiptTexts } from '@rotp/randomizer';
import { pondDemandLineKey } from '@rotp/randomizer';
import type { Placement } from '@rotp/randomizer';
import type { CheckId } from '@rotp/game-data';
import type { PhysicalPlan } from '@rotp/randomizer';
import type { ForeignItemOf } from '@rotp/randomizer';
import type { SessionReceiptTexts } from '@rotp/randomizer';

const completedKeysOf = (checks: ReadonlySet<CheckId>): Set<LocationKey> =>
  completedLocationKeys(checks, firedLocations());

const ownLocations = (placement: Placement): Placement['locations'] =>
  Object.fromEntries(Object.entries(placement.locations).filter(([, item]) => !isForeignItem(item))) as Placement['locations'];

const startSessionReceiptTexts = (
  plan: PhysicalPlan, placement: Placement, tag: string, foreignItemOf?: ForeignItemOf,
): SessionReceiptTexts => {
  const { stats } = placement;
  const locations = ownLocations(placement);
  const textsFor = (completed: ReadonlySet<LocationKey>) => buildPlanReceiptTexts(plan, placement,
    receiptCountsOf({ locations, keyDropShuffle: stats.keyDropShuffle, completed }), foreignItemOf);
  const first = textsFor(completedKeysOf(getCompletedChecks()));
  const messageIds = setSessionReceiptMessages(first.lines);
  let lastKeys = first.lines.map(receiptLineKey);

  const refresh = (checks: ReadonlySet<CheckId>): void => {
    if (messageIds === null) return;
    const next = textsFor(completedKeysOf(checks));
    const keys = next.lines.map(receiptLineKey);
    const changed = keys.filter((key, i) => key !== lastKeys[i]).length;
    if (changed === 0) return;
    lastKeys = keys;
    if (setSessionReceiptMessages(next.lines) === null) {
      log.randomizer(`${tag} Receipt text: refresh refused, the previous lines stand`, 'warn');
      return;
    }
    log.randomizer(`${tag} Receipt text: ${changed} line(s) re-composed for the tracker's new counts`);
  };
  const unsubscribeChecks = onCompletedChecksChanged(refresh);
  const unsubscribeFired = onFiredLocation(() => refresh(getCompletedChecks()));
  const stop = (): void => { unsubscribeChecks(); unsubscribeFired(); };

  const idAt = (index: number | undefined): number | undefined =>
    (messageIds !== null && index !== undefined ? messageIds[index] : undefined);
  const idOrNative = (index: number): number => (index >= 0 ? (idAt(index) ?? -1) : -1);
  return {
    composed: messageIds !== null,
    messageIdOf: (location) =>
      idAt(first.indexByLocation.get(location)) ?? first.fallbackByLocation.get(location) ?? -1,
    rungMessageIdOf: (family) =>
      (messageIds === null ? undefined : first.rungIndexByFamily.get(family)?.map((index) => messageIds[index])),
    fixedLineMessages: messageIds === null ? [] : first.fixedLines.map(({ family, fromRung, jump, index }) =>
      ({ family, fromRung, jump, messageId: messageIds[index] })),
    pondMessages: {
      priceMessageOf: (price) => idAt(first.pondLines.byPrice.get(price)) ?? -1,
      refundMessageOf: (refund) => idAt(first.pondLines.byRefund.get(refund)) ?? -1,
      awardMoreMessageId: idOrNative(first.pondLines.awardMore),
      awardLastMessageId: idOrNative(first.pondLines.awardLast),
      closedMessageId: idOrNative(first.pondLines.closed),
    },
    wishPondMessages: {
      awardMessageId: idOrNative(first.wishPondLines.award),
      closedMessageId: idOrNative(first.wishPondLines.closed),
    },
    pondDemandMessagesOf: (pond, rung) => {
      const at = first.pondDemandLines.get(pondDemandLineKey(pond, rung));
      const idOf = (index: number | undefined): number => (index !== undefined ? idOrNative(index) : -1);
      return { askMessageId: idOf(at?.ask), refuseMessageId: idOf(at?.refuse), awardMessageId: idOf(at?.award) };
    },
    stop,
  };
};

export { startSessionReceiptTexts };
export type { PondDemandMessageIds, PondDemandMessagesOf, PondMessageIds, SessionReceiptTexts, WishPondMessageIds } from '@rotp/randomizer';
