/**
 * Widget Store — localStorage + profile-based persistence for widget layouts.
 *
 * Two layers:
 *  1. localStorage ("widget-layout"): current in-memory layout for fast restore on reload.
 *  2. Per-profile IPC: saved/loaded via window.api (tracker state path) for cross-session persistence.
 */

import type { WidgetLayout, WidgetState } from '../types';
import { createDefaultLayout, WIDGET_DEFINITIONS, createDefaultWidgetState } from '../types';

const STORAGE_KEY = 'widget-layout';

// ─── Local (session) persistence ───

export const loadLayoutLocal = (): WidgetLayout => {
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

export const saveLayoutLocal = (layout: WidgetLayout): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
}

// ─── Profile persistence (via IPC) ───

export const loadLayoutForProfile = async (profileId: string): Promise<WidgetLayout> => {
  try {
    const state: any = await window.api.loadTrackerState(profileId);
    if (state?.widgetLayout) {
      return ensureAllWidgets(state.widgetLayout);
    }
  } catch { /* fall through */ }
  return loadLayoutLocal(); // Fallback to local layout
}

export const saveLayoutForProfile = async (profileId: string, layout: WidgetLayout): Promise<void> => {
  // Load existing tracker state and merge widget layout into it
  let existing: any = {};
  try {
    const raw = await window.api.loadTrackerState(profileId);
    if (raw && typeof raw === 'object') existing = raw;
  } catch { /* new state */ }

  existing.widgetLayout = layout;
  await window.api.saveTrackerState(profileId, existing);
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
export const getWidgetState = (layout: WidgetLayout, id: string): WidgetState | undefined => {
  return layout.widgets.find((w) => w.id === id);
}

/** Update a single widget in the layout. */
export const updateWidget = (layout: WidgetLayout, id: string, patch: Partial<WidgetState>): WidgetLayout => {
  return {
    widgets: layout.widgets.map((w) => (w.id === id ? { ...w, ...patch } : w)),
  };
}
