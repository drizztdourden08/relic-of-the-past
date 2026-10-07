/* @layer renderer-components @kind hook */
/**
 * Debounced whole-set persistence. A write is expensive (it recompiles every
 * cached asset blob), so an edit only records a snapshot and the write waits
 * for SAVE_DEBOUNCE_MS of quiet. `revision` counts edits and `persisted` holds
 * the revision the last completed write carried, so an edit landing mid-write
 * is re-armed instead of clobbered. `epoch` does the same for a set swap.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { LanguageSet } from '@shared/game/language';
import { saveLanguageSet } from '@app/lib/storage/languages-store';

const SAVE_DEBOUNCE_MS = 750;

const useSetPersistence = () => {
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const latest = useRef<LanguageSet | null>(null);
  const revision = useRef(0);
  const persisted = useRef(0);
  const epoch = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);
  const live = useRef(true);
  // Breaks the arm ⇄ run cycle: the timer reaches the latest `run` through here.
  const runRef = useRef<() => Promise<void>>(async () => {});

  const cancelTimer = useCallback(() => {
    if (timer.current === null) return;
    clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const arm = useCallback(() => {
    cancelTimer();
    timer.current = setTimeout(() => {
      timer.current = null;
      void runRef.current();
    }, SAVE_DEBOUNCE_MS);
  }, [cancelTimer]);

  const run = useCallback(async (): Promise<void> => {
    const snapshot = latest.current;
    if (!snapshot || inFlight.current || persisted.current === revision.current) return;
    const at = revision.current;
    const era = epoch.current;
    inFlight.current = true;
    if (live.current) { setSaving(true); setSaveError(null); }

    let failure: string | null = null;
    try {
      await saveLanguageSet(snapshot);
    } catch (err) {
      failure = err instanceof Error ? err.message : String(err);
    }
    inFlight.current = false;

    // A different set was loaded while this write ran, so its result is not ours.
    if (epoch.current !== era) return;
    if (live.current) setSaving(false);
    if (failure !== null) {
      if (live.current) setSaveError(failure);
      return; // stays dirty; the next edit (or saveNow) re-arms the write
    }

    persisted.current = at;
    const stale = revision.current !== at;
    if (live.current) {
      setDirty(stale);
      if (stale) arm();
      return;
    }
    // Unmounted: no timer will ever fire again, so persist the newer edit now.
    if (stale) await runRef.current();
  }, [arm]);

  useEffect(() => { runRef.current = run; }, [run]);

  /** Records an edited snapshot and restarts the quiet period before the write. */
  const markEdited = useCallback((next: LanguageSet) => {
    latest.current = next;
    revision.current += 1;
    setDirty(true);
    arm();
  }, [arm]);

  /** Re-baselines onto a freshly loaded set (or none), dropping pending writes. */
  const reset = useCallback((loaded: LanguageSet | null) => {
    cancelTimer();
    epoch.current += 1;
    latest.current = loaded;
    revision.current = 0;
    persisted.current = 0;
    setDirty(false);
    setSaving(false);
    setSaveError(null);
  }, [cancelTimer]);

  /** Explicit flush. With a write already in flight this returns at once; that write, or its re-arm, carries the newest snapshot. */
  const saveNow = useCallback(async (): Promise<void> => {
    cancelTimer();
    await run();
  }, [cancelTimer, run]);

  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
      cancelTimer();
      void runRef.current(); // flush a pending edit so unmounting never loses it
    };
  }, [cancelTimer]);

  return { dirty, saving, saveError, markEdited, reset, saveNow };
};

export { SAVE_DEBOUNCE_MS, useSetPersistence };
