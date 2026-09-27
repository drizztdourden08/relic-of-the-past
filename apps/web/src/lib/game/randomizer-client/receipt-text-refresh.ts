/* @layer bridge-wasm @kind logic */
/**
 * Session receipt texts: composes a local session's contextual lines and
 * keeps their numbers current. The found/total counts are a tracker fact
 * (receipt-counts.ts), so the lines are rendered from the completed-check
 * set at session start and re-rendered on every change of that set: a
 * chest opened, a save state loaded (the tracker re-derives from SRAM),
 * and the session dialogue is re-composed in place: the pool keeps its size
 * and order, so every message id the overrides hold stays valid. The
 * message ids the arming needs (per location, per rung, per fixed line) are
 * read off the first composition.
 *
 * The completed set is the tracker's checks plus the locations whose
 * substitution fired this session (override-fire-registry.ts): a shelf slot
 * has no check record, so a heart piece bought there would otherwise never
 * count, and the quarter the next piece announces would trail the game's own
 * piece counter by one.
 */

import type { LocationKey } from '@shared/randomizer/world/location-key';
import { receiptCountsOf } from '@shared/randomizer/receipt-text/receipt-counts';
import { receiptLineKey } from '@shared/randomizer/receipt-text/receipt-line.type';
import { log } from '../../log-bus';
import { setSessionReceiptMessages } from '../session-dialogue';
import { getCompletedChecks, onCompletedChecksChanged } from '../tracker';
import { completedLocationKeys } from './check-names';
import { firedLocations, onFiredLocation } from './override-fire-registry';
import { buildPlanReceiptTexts } from './receipt-plan-messages';
import { pondDemandLineKey } from './pond-demand-messages';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { CheckId } from '@shared/game/data';
import type { ReceiptLine } from '@shared/randomizer/receipt-text/receipt-line.type';
import type { CapacityFixedLineArm } from '../capacity-fixed-lines';
import type { MessageIdOf } from './apply-overrides';
import type { RungMessageIdOf } from './capacity-rung-messages';
import type { PhysicalPlan } from './physical-plan.type';

/**
 * The pond's own composed lines, by the amount each one quotes. Every getter
 * hands back -1 when nothing was composed (a legacy pond, or a refused
 * composition), which is exactly what the core reads as "no host line, keep
 * the native one".
 */
interface PondMessageIds {
  /** The line announcing a toss of |price| rupees. */
  priceMessageOf: (price: number) => number;
  /** The line a throw that won nothing shows, handing |refund| rupees back. */
  refundMessageOf: (refund: number) => number;
  /** The award line for a throw with a prize still to come after it. */
  awardMoreMessageId: number;
  /** The award line for the throw that hands over the pond's last prize. */
  awardLastMessageId: number;
  /** The line an emptied pond shows in place of the native come-back-later refusal. */
  closedMessageId: number;
}

/** The three lines of one asking pond rung; -1 for each one nothing was composed for. */
interface PondDemandMessageIds {
  askMessageId: number;
  refuseMessageId: number;
  awardMessageId: number;
}

/** The lines of rung |rung| at pond |pond|, in the core's own keys (pond_demands.h). */
type PondDemandMessagesOf = (pond: number, rung: number) => PondDemandMessageIds;

/** The wish ponds' two host lines, shared by both waters; -1 when nothing was composed. */
interface WishPondMessageIds {
  awardMessageId: number;
  closedMessageId: number;
}

interface SessionReceiptTexts {
  /** True when the session dialogue composed; false = the baked class lines are in use. */
  composed: boolean;
  messageIdOf: MessageIdOf;
  rungMessageIdOf: RungMessageIdOf;
  fixedLineMessages: readonly CapacityFixedLineArm[];
  pondMessages: PondMessageIds;
  wishPondMessages: WishPondMessageIds;
  pondDemandMessagesOf: PondDemandMessagesOf;
  /** Stop following the tracker (session stop). */
  stop: () => void;
}

const completedKeysOf = (checks: ReadonlySet<CheckId>): Set<LocationKey> =>
  completedLocationKeys(checks, firedLocations());

const startSessionReceiptTexts = (plan: PhysicalPlan, placement: Placement, tag: string): SessionReceiptTexts => {
  const { locations, stats } = placement;
  const textsFor = (completed: ReadonlySet<LocationKey>) =>
    buildPlanReceiptTexts(plan, placement, receiptCountsOf({ locations, keyDropShuffle: stats.keyDropShuffle, completed }));
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
  return {
    composed: messageIds !== null,
    // Composition refused (unreadable blob, untranslatable language): degrade to
    // the baked class-template line for the grant instead of showing nothing.
    messageIdOf: (location) =>
      idAt(first.indexByLocation.get(location)) ?? first.fallbackByLocation.get(location) ?? -1,
    rungMessageIdOf: (family) =>
      (messageIds === null ? undefined : first.rungIndexByFamily.get(family)?.map((index) => messageIds[index])),
    fixedLineMessages: messageIds === null ? [] : first.fixedLines.map(({ family, fromRung, jump, index }) =>
      ({ family, fromRung, jump, messageId: messageIds[index] })),
    pondMessages: {
      priceMessageOf: (price) => idAt(first.pondLines.byPrice.get(price)) ?? -1,
      refundMessageOf: (refund) => idAt(first.pondLines.byRefund.get(refund)) ?? -1,
      awardMoreMessageId: first.pondLines.awardMore >= 0 ? (idAt(first.pondLines.awardMore) ?? -1) : -1,
      awardLastMessageId: first.pondLines.awardLast >= 0 ? (idAt(first.pondLines.awardLast) ?? -1) : -1,
      closedMessageId: first.pondLines.closed >= 0 ? (idAt(first.pondLines.closed) ?? -1) : -1,
    },
    wishPondMessages: {
      awardMessageId: first.wishPondLines.award >= 0 ? (idAt(first.wishPondLines.award) ?? -1) : -1,
      closedMessageId: first.wishPondLines.closed >= 0 ? (idAt(first.wishPondLines.closed) ?? -1) : -1,
    },
    pondDemandMessagesOf: (pond, rung) => {
      const at = first.pondDemandLines.get(pondDemandLineKey(pond, rung));
      const idOf = (index: number | undefined): number => (index !== undefined && index >= 0 ? (idAt(index) ?? -1) : -1);
      return { askMessageId: idOf(at?.ask), refuseMessageId: idOf(at?.refuse), awardMessageId: idOf(at?.award) };
    },
    stop,
  };
};

export { startSessionReceiptTexts };
export type { PondDemandMessageIds, PondDemandMessagesOf, PondMessageIds, SessionReceiptTexts, WishPondMessageIds };
