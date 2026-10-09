/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { LanguageSet } from '@rotp/languages';
import { saveLanguageSet } from '@app/storage/languages-store';
import { SAVE_DEBOUNCE_MS } from './useSetPersistence.constants';

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

    if (epoch.current !== era) return;
    if (live.current) setSaving(false);
    if (failure !== null) {
      if (live.current) setSaveError(failure);
      return;
    }

    persisted.current = at;
    const stale = revision.current !== at;
    if (live.current) {
      setDirty(stale);
      if (stale) arm();
      return;
    }
    if (stale) await runRef.current();
  }, [arm]);

  useEffect(() => { runRef.current = run; }, [run]);

  const markEdited = useCallback((next: LanguageSet) => {
    latest.current = next;
    revision.current += 1;
    setDirty(true);
    arm();
  }, [arm]);

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

  const saveNow = useCallback(async (): Promise<void> => {
    cancelTimer();
    await run();
  }, [cancelTimer, run]);

  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
      cancelTimer();
      void runRef.current();
    };
  }, [cancelTimer]);

  return { dirty, saving, saveError, markEdited, reset, saveNow };
};

export { useSetPersistence };
