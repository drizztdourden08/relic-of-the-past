/* @layer renderer-components @kind hook */
/** Widget layout state: local persistence plus profile-based save/load. */
import { useState, useCallback, useEffect, useRef } from 'react';
import type { WidgetLayout, WidgetState } from '../Widget.type';
import { loadLayoutLocal, saveLayoutLocal, loadLayoutForProfile, saveLayoutForProfile, updateWidget } from './widgetStore';
import type { WidgetPersistenceIO } from './widgetStore';
import { createDefaultLayout, createDefaultWidgetState, getWidgetDefinition } from './createWidgetState';

/** Test/automation startup override (from --fresh / --widgets, see startup-config.ts). */
interface StartupOverride {
  fresh: boolean;
  widgets: string[];
}

/**
 * Force the requested widgets open + docked (shrinking the game) on their default
 * side.
 *
 * It deliberately does NOT touch `visibility`. Writing 'always' here was persisted,
 * so one `--widgets=` screenshot run permanently converted those widgets into ones
 * that never leave the screen, in a profile the flag was never meant to change.
 * WidgetManager exempts the forced ids from the game-only filter instead, which is
 * where a render-time override belongs.
 */
const applyStartupWidgets = (layout: WidgetLayout, ids: string[]): WidgetLayout => {
  if (ids.length === 0) return layout;
  return {
    widgets: layout.widgets.map((w) => (ids.includes(w.id)
      ? { ...w, visible: true, mode: 'docked', exclusive: true, side: getWidgetDefinition(w.id)?.defaultSide ?? w.side }
      : w)),
  };
};

const buildInitialLayout = (startup?: StartupOverride): WidgetLayout => {
  const base = startup?.fresh ? createDefaultLayout() : loadLayoutLocal();
  return applyStartupWidgets(base, startup?.widgets ?? []);
};

const useWidgetLayout = (profileId: string | null, io: WidgetPersistenceIO, startup?: StartupOverride) => {
  const [layout, setLayoutRaw] = useState<WidgetLayout>(() => buildInitialLayout(startup));
  const profileIdRef = useRef(profileId);
  profileIdRef.current = profileId;
  const ioRef = useRef(io);
  ioRef.current = io;

  // Load layout when profile changes. --fresh keeps the clean startup layout and
  // never loads the saved profile layout.
  useEffect(() => {
    if (!profileId || startup?.fresh) return;
    loadLayoutForProfile(profileId, ioRef.current).then((loaded) => {
      const next = applyStartupWidgets(loaded, startup?.widgets ?? []);
      setLayoutRaw(next);
      saveLayoutLocal(next);
    });
  }, [profileId]);

  // Persist on every change, skipped under --fresh so tests never clobber the
  // user's real saved layout.
  const setLayout = useCallback((updater: (prev: WidgetLayout) => WidgetLayout) => {
    setLayoutRaw((prev) => {
      const next = updater(prev);
      if (startup?.fresh) return next;
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
        // Widget not in layout yet, so create it as visible
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
