/* @layer renderer-components @kind hook */
// Opens on onActiveProfileChange and auto-hides. No-op with a single profile, since cycling never fires.

import { useState, useEffect, useRef } from 'react';
import { getInputManager } from '../../../../../../lib/game';
import type { FunctionAction, FunctionMapping, InputProfile } from '@shared/types/controls';

const AUTO_HIDE_MS = 1600;

const findMapping = (mappings: FunctionMapping[], action: FunctionAction): FunctionMapping | null =>
  mappings.find(m => m.action === action && m.binding.type !== 'none') ?? null;

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
    prevMapping: findMapping(mappings, 'profile-prev'),
    nextMapping: findMapping(mappings, 'profile-next'),
  };
};

export { useProfileSwitcher };
