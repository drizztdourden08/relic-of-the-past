/* @layer renderer-components @kind hook */
/**
 * The checks that were just completed, as a short-lived queue. Two sources, because a seed has
 * two ways of finishing a row:
 *
 *  - the tracker's completed set, diffed on every change, which covers every row the game
 *    writes a flag for;
 *  - the substitution seam's own reports (override-fire-registry.ts), which are the only word
 *    on a row no check record can see: a shop shelf, a pond prize past the reference's two,
 *    any virtual row. Those never reach the completed set, so on a seed they used to pass
 *    silently while every other row raised a toast.
 *
 * What turns up right after a save state is loaded was done in that state, not just now, and
 * shows nothing; neither does a large jump (a profile switch, or a session arming that
 * backfills what an earlier one already bought). The tracker itself still follows both.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { get, getCheck } from '@shared/game/data';
import type { CheckId, CheckRecord, ItemId } from '@shared/game/data';
import { checkIdOfLocation } from '@shared/randomizer/world/location-record';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import { virtualCheckIdOf } from '@app/lib/game/randomizer-client/virtual-locations';
import { chestSwapOf } from '@shared/game/logic/queries/chest-stand-ins';
import { getCompletedChecks, onCompletedChecksChanged, onItemReceived, wasStateJustLoaded } from '@app/lib/game';
import {
  firedLocations, getSessionState, onFiredLocation, virtualChecksOf,
} from '@app/lib/game/randomizer-client';

/** More rows than this at once is a load, not something the player just did. */
const MAX_BURST = 6;
const MAX_VISIBLE = 5;
/** An item received this recently belongs to the chest that just completed. */
const RECEIPT_WINDOW_MS = 3000;
/** How long after a state load a change still belongs to the load: two sweeps, so the combined rows land too. */
const LOAD_QUIET_MS = 5000;

interface CheckToastEntry {
  id: string;
  /** The row itself, real or virtual, so a location with no check record can still show a card. */
  check: CheckRecord;
  /** What a swap chest really paid, when the game said so as it opened. */
  paid?: ItemId;
}

/** The row a reported location belongs to: its check record, or the virtual row this seed minted for it. */
const recordOfLocation = (location: LocationKey): CheckRecord | undefined => {
  // A location with a record shows that record; any other row is the virtual one the seed minted.
  const checkId = checkIdOfLocation(location);
  if (checkId !== undefined) return get('check', checkId);
  const { placement } = getSessionState();
  if (placement === null) return undefined;
  const id = virtualCheckIdOf(location);
  return virtualChecksOf(placement).find((record) => record.id === id);
};

const useCheckToasts = (enabled: boolean) => {
  const [entries, setEntries] = useState<CheckToastEntry[]>([]);
  const known = useRef<Set<CheckId>>(new Set(getCompletedChecks()));
  /** Rows already announced from the seam, so the completed set does not announce them again. */
  const reported = useRef<Set<string>>(new Set());
  const pendingFired = useRef<LocationKey[]>([]);
  const serial = useRef(0);
  const lastReceipt = useRef<{ itemId: ItemId; at: number } | null>(null);

  useEffect(() => onItemReceived((itemId) => { lastReceipt.current = { itemId, at: Date.now() }; }), []);

  /** A swap chest's own receipt: the real item or its stand-in, whichever the game just handed over. */
  const paidBy = (check: CheckRecord): ItemId | undefined => {
    const swap = chestSwapOf(check);
    const receipt = lastReceipt.current;
    if (!swap || !receipt || Date.now() - receipt.at > RECEIPT_WINDOW_MS) return undefined;
    return receipt.itemId === swap.primary || receipt.itemId === swap.standIn ? receipt.itemId : undefined;
  };
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const show = useCallback((rows: readonly CheckRecord[], paid: (check: CheckRecord) => ItemId | undefined) => {
    // Off still follows both sources, so turning it on later never replays what was done meanwhile.
    if (!enabledRef.current || rows.length === 0 || rows.length > MAX_BURST || wasStateJustLoaded(LOAD_QUIET_MS)) return;
    setEntries((prev) => [
      ...prev,
      ...rows.map((check) => ({ id: `check-toast-${serial.current++}`, check, paid: paid(check) })),
    ].slice(-MAX_VISIBLE));
  }, []);

  useEffect(() => onCompletedChecksChanged((checks) => {
    const next = new Set<CheckId>(checks);
    const added = [...next].filter((id) => !known.current.has(id) && !reported.current.has(id));
    known.current = next;
    show(added.map((id) => getCheck(id)), paidBy);
  }), [show]);

  // Every report of one synchronous burst lands in one batch, so a backfilled session arming
  // reads as the jump it is instead of one toast per past purchase.
  useEffect(() => {
    // Whatever the seam had already reported before this mounted is not news.
    for (const name of firedLocations()) {
      const record = recordOfLocation(name);
      if (record !== undefined) reported.current.add(record.id);
    }
    return onFiredLocation((locationName) => {
      const record = recordOfLocation(locationName);
      if (record === undefined || reported.current.has(record.id)) return;
      reported.current.add(record.id);
      pendingFired.current.push(locationName);
      if (pendingFired.current.length > 1) return;
      queueMicrotask(() => {
        const names = pendingFired.current;
        pendingFired.current = [];
        const rows = names.map(recordOfLocation).filter((row): row is CheckRecord => row !== undefined);
        show(rows, () => undefined);
      });
    });
  }, [show]);

  const dismiss = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  return { entries, dismiss };
};

export { useCheckToasts };
export type { CheckToastEntry };
