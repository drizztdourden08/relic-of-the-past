/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';
import type { LanguageSet } from '@rotp/languages';
import { SAVE_DEBOUNCE_MS } from './set-persistence.constants';
import { saveFailureOf } from './persistence/save-failure-of';
import { settleSave } from './persistence/settle-save';
import { useFlushOnUnmount } from './persistence/useFlushOnUnmount';
import { usePersistenceRefs } from './persistence/usePersistenceRefs';

const useSetPersistence = () => {
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const refs = usePersistenceRefs();
  const { latest, revision, persisted, epoch, timer, inFlight, live, runRef } = refs;

  const cancelTimer = useCallback(() => {
    if (timer.current === null) return;
    clearTimeout(timer.current);
    timer.current = null;
  }, [timer]);

  const arm = useCallback(() => {
    cancelTimer();
    timer.current = setTimeout(() => {
      timer.current = null;
      void runRef.current();
    }, SAVE_DEBOUNCE_MS);
  }, [cancelTimer, timer, runRef]);

  const run = useCallback(async (): Promise<void> => {
    const snapshot = latest.current;
    if (!snapshot || inFlight.current || persisted.current === revision.current) return;
    const at = revision.current;
    const era = epoch.current;
    inFlight.current = true;
    if (live.current) { setSaving(true); setSaveError(null); }
    const failure = await saveFailureOf(snapshot);
    await settleSave({ refs, setDirty, setSaving, setSaveError, arm }, { at, era, failure });
  }, [arm, refs, latest, inFlight, persisted, revision, epoch, live]);

  useEffect(() => { runRef.current = run; }, [run, runRef]);

  const markEdited = useCallback((next: LanguageSet) => {
    latest.current = next;
    revision.current += 1;
    setDirty(true);
    arm();
  }, [arm, latest, revision]);

  const reset = useCallback((loaded: LanguageSet | null) => {
    cancelTimer();
    epoch.current += 1;
    latest.current = loaded;
    revision.current = 0;
    persisted.current = 0;
    setDirty(false);
    setSaving(false);
    setSaveError(null);
  }, [cancelTimer, epoch, latest, revision, persisted]);

  const saveNow = useCallback(async (): Promise<void> => {
    cancelTimer();
    await run();
  }, [cancelTimer, run]);

  useFlushOnUnmount(refs, cancelTimer);

  return { dirty, saving, saveError, markEdited, reset, saveNow };
};

export { useSetPersistence };
