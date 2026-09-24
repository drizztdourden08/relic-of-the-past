/* @layer sanctuary-site @kind hook */
/**
 * The user's named views of one surface: listed on mount, saved from the live arrangement,
 * renamed, deleted, and applied. Applying copies the view's snapshot into the surface's
 * live record and tells the page, which bumps its key nonce so the table reloads.
 */
import { useCallback, useEffect, useState } from 'react';
import type { SavedView, ViewSurface } from '@shared/sanctuary/types';
import { emptySnapshot, isViewSnapshot } from '@ds/data/view-state/snapshot';
import { listViews, putView, deleteView } from '../api/views-endpoints';
import { errorMessage } from '../api/client';
import { applyView, current } from './sanctuary-view-storage';
import { isCurrentViewId } from './view-keys';

type UseSavedViewsParams = {
  surface: ViewSurface;
  /** Called after a view's snapshot became the live arrangement. */
  onApplied: () => void;
};

const useSavedViews = (params: UseSavedViewsParams) => {
  const { surface, onApplied } = params;
  const [views, setViews] = useState<SavedView[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (work: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await work();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void run(async () => {
      const { views: rows } = await listViews(surface);
      setViews(rows.filter((view) => !isCurrentViewId(view.id)));
    });
  }, [surface, run]);

  const upsert = useCallback((view: SavedView) => {
    setViews((rows) => [...rows.filter((row) => row.id !== view.id), view].sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  const saveAs = useCallback((name: string) => run(async () => {
    const saved = await putView(crypto.randomUUID(), { surface, name, snapshot: current(surface) ?? emptySnapshot() });
    upsert(saved);
    setActiveId(saved.id);
  }), [run, surface, upsert]);

  /** Overwrites the named view with the live arrangement. */
  const update = useCallback((id: string) => run(async () => {
    const view = views.find((row) => row.id === id);
    if (!view) return;
    upsert(await putView(id, { surface, name: view.name, snapshot: current(surface) ?? view.snapshot }));
  }), [run, views, surface, upsert]);

  const rename = useCallback((id: string, name: string) => run(async () => {
    const view = views.find((row) => row.id === id);
    if (!view) return;
    upsert(await putView(id, { surface, name, snapshot: view.snapshot }));
  }), [run, views, surface, upsert]);

  const remove = useCallback((id: string) => run(async () => {
    await deleteView(id);
    setViews((rows) => rows.filter((row) => row.id !== id));
    setActiveId((active) => (active === id ? null : active));
  }), [run]);

  const apply = useCallback((id: string) => run(async () => {
    const view = views.find((row) => row.id === id);
    if (!view || !isViewSnapshot(view.snapshot)) throw new Error('This view cannot be read any more.');
    await applyView(surface, view.snapshot);
    setActiveId(id);
    onApplied();
  }), [run, views, surface, onApplied]);

  const active = views.find((view) => view.id === activeId) ?? null;
  return { views, active, busy, error, saveAs, update, rename, remove, apply };
};

type SavedViewsState = ReturnType<typeof useSavedViews>;

export { useSavedViews };
export type { SavedViewsState, UseSavedViewsParams };
