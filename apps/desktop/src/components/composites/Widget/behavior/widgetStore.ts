/* @layer renderer-components @kind logic */
/**
 * Widget Store — localStorage + profile-based persistence for widget layouts.
 *
 * Two layers:
 *  1. localStorage ("widget-layout"): current in-memory layout for fast restore on reload.
 *  2. Per-profile persistence: round-tripped through an injected WidgetPersistenceIO
 *     (provided by the View tier) so this bare composite never imports IPC directly.
 */

import type { WidgetLayout, WidgetState } from '../types';
import { WIDGET_DEFINITIONS } from '../constants';
import { createDefaultLayout, createDefaultWidgetState } from './createWidgetState';

/** Persistence round-trip injected by the View tier (keeps IPC out of the composite). */
interface WidgetPersistenceIO {
  load: (profileId: string) => Promise<Record<string, unknown> | null>;
  save: (profileId: string, blob: Record<string, unknown>) => Promise<void>;
}

const STORAGE_KEY = 'widget-layout';

// ─── Local (session) persistence ───

const loadLayoutLocal = (): WidgetLayout => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: WidgetLayout = JSON.parse(raw);
      // Ensure all known widgets exist (handles new widgets added in updates)
      return ensureAllWidgets(parsed);
    }
  } catch { /* corrupt, use defaults */ }
  return createDefaultLayout();
}

const saveLayoutLocal = (layout: WidgetLayout): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
}

// ─── Profile persistence (via injected IO) ───

const loadLayoutForProfile = async (profileId: string, io: WidgetPersistenceIO): Promise<WidgetLayout> => {
  try {
    const state = await io.load(profileId);
    const layout = state?.widgetLayout as WidgetLayout | undefined;
    if (layout) return ensureAllWidgets(layout);
  } catch { /* fall through */ }
  return loadLayoutLocal(); // Fallback to local layout
}

const saveLayoutForProfile = async (profileId: string, layout: WidgetLayout, io: WidgetPersistenceIO): Promise<void> => {
  // Load existing tracker state and merge widget layout into it
  let existing: Record<string, unknown> = {};
  try {
    const raw = await io.load(profileId);
    if (raw) existing = raw;
  } catch { /* new state */ }

  existing.widgetLayout = layout;
  await io.save(profileId, existing);
}

// ─── Helpers ───

/** Ensure the layout has entries for all defined widgets (forward-compat). */
const ensureAllWidgets = (layout: WidgetLayout): WidgetLayout => {
  const existing = new Set(layout.widgets.map((w) => w.id));
  const missing = WIDGET_DEFINITIONS.filter((d) => !existing.has(d.id));
  if (missing.length === 0) return layout;
  return {
    widgets: [
      ...layout.widgets,
      ...missing.map((def, i) => createDefaultWidgetState(def, layout.widgets.length + i)),
    ],
  };
}

/** Get a single widget state from the layout. */
const getWidgetState = (layout: WidgetLayout, id: string): WidgetState | undefined => {
  return layout.widgets.find((w) => w.id === id);
}

/** Update a single widget in the layout. */
const updateWidget = (layout: WidgetLayout, id: string, patch: Partial<WidgetState>): WidgetLayout => {
  return {
    widgets: layout.widgets.map((w) => (w.id === id ? { ...w, ...patch } : w)),
  };
}

export {
  getWidgetState,
  loadLayoutForProfile,
  loadLayoutLocal,
  saveLayoutForProfile,
  saveLayoutLocal,
  updateWidget
};
export type { WidgetPersistenceIO };
