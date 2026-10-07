/* @layer renderer-components @kind logic */
/**
 * localStorage plus profile-based persistence for widget layouts.
 *
 * Two layers:
 *  1. localStorage ("widget-layout"): current in-memory layout for fast restore on reload.
 *  2. Per-profile persistence: round-tripped through an injected WidgetPersistenceIO
 *     (provided by the View tier) so this bare composite never imports IPC directly.
 *
 * Both read through migrateLayout, so a layout saved by an older build loads too.
 */

import type { WidgetLayout } from '@shared/types/widget-layout';
import { migrateLayout } from './migrate-layout';

/** Persistence round-trip injected by the View tier (keeps IPC out of the composite). */
interface WidgetPersistenceIO {
  load: (profileId: string) => Promise<Record<string, unknown> | null>;
  save: (profileId: string, blob: Record<string, unknown>) => Promise<void>;
}

const STORAGE_KEY = 'widget-layout';

const loadLayoutLocal = (): WidgetLayout => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrateLayout(JSON.parse(raw));
  } catch { /* corrupt, use defaults */ }
  return migrateLayout(null);
};

const saveLayoutLocal = (layout: WidgetLayout): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch { /* storage unavailable */ }
};

const loadLayoutForProfile = async (profileId: string, io: WidgetPersistenceIO): Promise<WidgetLayout> => {
  try {
    const state = await io.load(profileId);
    if (state?.widgetLayout) return migrateLayout(state.widgetLayout);
  } catch { /* fall through */ }
  return loadLayoutLocal();
};

const saveLayoutForProfile = async (profileId: string, layout: WidgetLayout, io: WidgetPersistenceIO): Promise<void> => {
  let existing: Record<string, unknown> = {};
  try {
    const raw = await io.load(profileId);
    if (raw) existing = raw;
  } catch { /* new state */ }
  existing.widgetLayout = layout;
  await io.save(profileId, existing);
};

export { loadLayoutForProfile, loadLayoutLocal, saveLayoutForProfile, saveLayoutLocal };
export type { WidgetPersistenceIO };
