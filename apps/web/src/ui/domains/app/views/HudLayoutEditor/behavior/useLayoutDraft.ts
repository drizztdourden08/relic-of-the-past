/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHudLayoutStore } from '@app/stores/hud-layout-store';
import {
  forkLayout, listLayouts, resolveStoredLayout, saveCustomLayout,
} from '@app/lib/hud/layout-document-io';
import type { HudLayout } from '@shared/types/hud';
import type { LayoutDraft } from './useLayoutDraft.type';

const sameLayout = (a: HudLayout | null, b: HudLayout | null): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

const useLayoutDraft = (layoutId: string, onCommitted?: (layout: HudLayout) => void): LayoutDraft => {
  const setLiveLayout = useHudLayoutStore((s) => s.setLayout);
  const [origin, setOrigin] = useState<HudLayout | null>(null);
  const [draft, setDraft] = useState<HudLayout | null>(null);
  const [layouts, setLayouts] = useState<readonly HudLayout[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    void (async () => {
      const [opened, all] = await Promise.all([resolveStoredLayout(layoutId), listLayouts()]);
      if (cancelled) return;
      setOrigin(opened);
      setDraft(structuredClone(opened));
      setLayouts(all);
      setBusy(false);
    })();
    return () => { cancelled = true; };
  }, [layoutId]);

  const apply = useCallback((change: (doc: HudLayout) => HudLayout) => {
    setDraft((current) => (current ? change(current) : current));
  }, []);

  const rename = useCallback((name: string) => {
    setDraft((current) => (current ? { ...current, name } : current));
  }, []);

  const setGlyphPack = useCallback((glyphPack: string) => {
    setDraft((current) => (current ? { ...current, glyphPack } : current));
  }, []);

  const startFrom = useCallback((source: HudLayout) => {
    setDraft((current) => {
      const copy = structuredClone(source);
      if (!current || current.builtIn) return copy;
      return { ...copy, id: current.id, name: current.name, builtIn: false, basedOn: source.basedOn ?? source.id };
    });
  }, []);

  const reset = useCallback(() => { setDraft(origin ? structuredClone(origin) : null); }, [origin]);

  const commit = useCallback(async (layout: HudLayout): Promise<HudLayout> => {
    setBusy(true);
    const saved = await saveCustomLayout(layout);
    setOrigin(saved);
    setDraft(structuredClone(saved));
    setLayouts(await listLayouts());
    setLiveLayout(saved);
    onCommitted?.(saved);
    setBusy(false);
    return saved;
  }, [onCommitted, setLiveLayout]);

  const saveAs = useCallback(async (name: string) => {
    if (!draft) return null;
    return commit(forkLayout(draft, name));
  }, [commit, draft]);

  const save = useCallback(async () => {
    if (!draft) return null;
    return draft.builtIn ? commit(forkLayout(draft, `${draft.name} (edited)`)) : commit(draft);
  }, [commit, draft]);

  const dirty = useMemo(() => !!draft && !sameLayout(draft, origin), [draft, origin]);

  return { draft, apply, layouts, dirty, busy, rename, setGlyphPack, startFrom, reset, save, saveAs };
};

export { useLayoutDraft };
export type { LayoutDraft } from './useLayoutDraft.type';
