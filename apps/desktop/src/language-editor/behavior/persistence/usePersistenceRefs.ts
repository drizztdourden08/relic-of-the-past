/* @layer renderer-components @kind hook */
import { useMemo, useRef } from 'react';
import type { LanguageSet } from '@rotp/languages';
import type { PersistenceRefs } from './persistence.type';

const usePersistenceRefs = (): PersistenceRefs => {
  const latest = useRef<LanguageSet | null>(null);
  const revision = useRef(0);
  const persisted = useRef(0);
  const epoch = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);
  const live = useRef(true);
  const runRef = useRef<() => Promise<void>>(() => Promise.resolve());
  return useMemo(
    () => ({ latest, revision, persisted, epoch, timer, inFlight, live, runRef }),
    [latest, revision, persisted, epoch, timer, inFlight, live, runRef],
  );
};

export { usePersistenceRefs };
