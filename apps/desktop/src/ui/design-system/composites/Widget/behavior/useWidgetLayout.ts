/* @layer renderer-components @kind hook */
/**
 * useWidgetLayout — React hook that manages widget layout state.
 * Handles local persistence + profile-based save/load.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import type { WidgetLayout, WidgetState } from '../Widget.type';
import { loadLayoutLocal, saveLayoutLocal, loadLayoutForProfile, saveLayoutForProfile, updateWidget } from './widgetStore';
import type { WidgetPersistenceIO } from './widgetStore';
import { createDefaultWidgetState, getWidgetDefinition } from './createWidgetState';

const useWidgetLayout = (profileId: string | null, io: WidgetPersistenceIO) => {
  const [layout, setLayoutRaw] = useState<WidgetLayout>(loadLayoutLocal);
  const profileIdRef = useRef(profileId);
  profileIdRef.current = profileId;
  const ioRef = useRef(io);
  ioRef.current = io;

  // Load layout when profile changes
  useEffect(() => {
    if (!profileId) return;
    loadLayoutForProfile(profileId, ioRef.current).then((loaded) => {
      setLayoutRaw(loaded);
      saveLayoutLocal(loaded);
    });
  }, [profileId]);

  // Persist on every change
  const setLayout = useCallback((updater: (prev: WidgetLayout) => WidgetLayout) => {
    setLayoutRaw((prev) => {
      const next = updater(prev);
      saveLayoutLocal(next);
      // Debounced profile save (fire-and-forget)
      if (profileIdRef.current) {
        saveLayoutForProfile(profileIdRef.current, next, ioRef.current);
      }
      return next;
    });
  }, []);

  const update = useCallback((id: string, patch: Partial<WidgetState>) => {
    setLayout((prev) => updateWidget(prev, id, patch));
  }, [setLayout]);

  const close = useCallback((id: string) => {
    setLayout((prev) => updateWidget(prev, id, { visible: false }));
  }, [setLayout]);

  const open = useCallback((id: string) => {
    setLayout((prev) => updateWidget(prev, id, { visible: true }));
  }, [setLayout]);

  const toggle = useCallback((id: string) => {
    setLayout((prev) => {
      const w = prev.widgets.find((w) => w.id === id);
      if (!w) {
        // Widget not in layout yet — create it as visible
        const def = getWidgetDefinition(id);
        if (!def) return prev;
        return { widgets: [...prev.widgets, { ...createDefaultWidgetState(def, prev.widgets.length), visible: true }] };
      }
      return updateWidget(prev, id, { visible: !w.visible });
    });
  }, [setLayout]);

  return { layout, update, close, open, toggle };
}

export { useWidgetLayout };
