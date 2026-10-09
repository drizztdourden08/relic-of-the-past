/* @layer renderer-components @kind hook */
import { useState, useEffect, useRef } from 'react';
import { getInputManager } from '../../../../../../lib/game';
import type { InputProfile } from '@shared/types/controls';
import { findFunctionMapping } from './find-function-mapping';
import { AUTO_HIDE_MS } from './useProfileSwitcher.constants';

const useProfileSwitcher = (isRunning: boolean) => {
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<InputProfile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!isRunning) return undefined;
    const mgr = getInputManager();
    const unsub = mgr.onActiveProfileChange((profile) => {
      setProfiles(mgr.getProfiles());
      setActiveId(profile.id);
      setOpen(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setOpen(false), AUTO_HIDE_MS);
    });
    return () => { unsub(); clearTimeout(timerRef.current); };
  }, [isRunning]);

  const mappings = getInputManager().getFunctionMappings();
  return {
    open,
    profiles,
    activeId,
    prevMapping: findFunctionMapping(mappings, 'profile-prev'),
    nextMapping: findFunctionMapping(mappings, 'profile-next'),
  };
};

export { useProfileSwitcher };
