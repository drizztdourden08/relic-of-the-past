/* @layer renderer-components @kind hook */
/**
 * The working layout, kept as a Memento.
 *
 * The editor never touches the live layout. It takes a copy of the one in force
 * when it opened (`origin`, which is never written to), edits `draft`, and only
 * on an explicit Save does the draft reach storage and the layout store. So
 * closing the editor on purpose or by walking away leaves the HUD
 * exactly as it was found, and Reset goes back to the memento instead of
 * replaying an undo log.
 *
 * `dirty` is a comparison against that same memento, not a flag: there is no
 * second piece of state to keep in step, and an edit that happens to restore
 * the original correctly reports nothing to save.
 *
 * A built-in layout cannot be saved over because it is a file in this repository,
 * not data. Editing one and pressing Save is a fork, which is what "Save as..."
 * makes explicit.
 *
 * IT OWNS THE DOCUMENT, NOT THE EDITS. `apply` takes a pure transform over the
 * whole layout and is the ONE way anything changes it, so the tree operations
 * (`node-edits.ts`) stay pure functions with no React in them and this file
 * stays about the memento. The toolbar's insert, the outline's drag and the
 * inspector's field all arrive through that one door.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHudLayoutStore } from '@app/stores/hud-layout-store';
import {
  forkLayout, listLayouts, resolveStoredLayout, saveCustomLayout,
} from '@app/lib/hud/layout-document-io';
import type { HudLayout } from '@shared/types/hud';

interface LayoutDraft {
  draft: HudLayout | null;
  /** The one door every tree edit comes through. */
  apply: (change: (doc: HudLayout) => HudLayout) => void;
  /** Every layout the "start from" list offers: shipped ones, then custom. */
  layouts: readonly HudLayout[];
  dirty: boolean;
  busy: boolean;
  rename: (name: string) => void;
  setGlyphPack: (glyphPack: string) => void;
  startFrom: (layout: HudLayout) => void;
  reset: () => void;
  save: () => Promise<HudLayout | null>;
  saveAs: (name: string) => Promise<HudLayout | null>;
}

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

  /** Adopting another layout keeps the draft's own identity when it already has
   *  one, so "start from" restyles the layout being edited instead of silently
   *  switching which layout is open. */
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
    // A shipped layout is a file in this repository; saving one is always a fork.
    return draft.builtIn ? commit(forkLayout(draft, `${draft.name} (edited)`)) : commit(draft);
  }, [commit, draft]);

  const dirty = useMemo(() => !!draft && !sameLayout(draft, origin), [draft, origin]);

  return { draft, apply, layouts, dirty, busy, rename, setGlyphPack, startFrom, reset, save, saveAs };
};

export { useLayoutDraft };
export type { LayoutDraft };
