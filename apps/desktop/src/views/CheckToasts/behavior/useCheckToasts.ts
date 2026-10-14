/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { getCheck, chestSwapOf } from '@rotp/game-data';
import type { CheckId, CheckRecord, ItemId } from '@rotp/game-data';
import type { LocationKey } from '@rotp/randomizer';
import { getCompletedChecks, onCompletedChecksChanged, onItemReceived } from '@app/game';
import { isToastQuiet } from '@app/game/play-quiet';
import { firedLocations, onFiredLocation } from '@app/game/randomizer-client';
import { LOAD_QUIET_MS, MAX_BURST, MAX_VISIBLE, RECEIPT_WINDOW_MS } from '../CheckToasts.constants';
import type { CheckToastEntry } from '../CheckToasts.type';
import { recordOfLocation } from './record-of-location';
import { recordsOfLocations } from './records-of-locations';

const unpaid = (): undefined => undefined;

const useCheckToasts = (enabled: boolean) => {
  const [entries, setEntries] = useState<CheckToastEntry[]>([]);
  const known = useRef<Set<CheckId>>(new Set(getCompletedChecks()));
  const reported = useRef<Set<string>>(new Set());
  const pendingFired = useRef<LocationKey[]>([]);
  const serial = useRef(0);
  const lastReceipt = useRef<{ itemId: ItemId; at: number } | null>(null);

  useEffect(() => onItemReceived((itemId) => { lastReceipt.current = { itemId, at: Date.now() }; }), []);

  const paidBy = (check: CheckRecord): ItemId | undefined => {
    const swap = chestSwapOf(check);
    const receipt = lastReceipt.current;
    if (!swap || !receipt || Date.now() - receipt.at > RECEIPT_WINDOW_MS) return undefined;
    return receipt.itemId === swap.primary || receipt.itemId === swap.standIn ? receipt.itemId : undefined;
  };
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const show = useCallback((rows: readonly CheckRecord[], paid: (check: CheckRecord) => ItemId | undefined) => {
    if (!enabledRef.current || rows.length === 0 || rows.length > MAX_BURST || isToastQuiet(LOAD_QUIET_MS)) return;
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

  useEffect(() => {
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
        show(recordsOfLocations(names), unpaid);
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
