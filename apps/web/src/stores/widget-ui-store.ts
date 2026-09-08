/* @layer renderer-stores @kind logic */
/**
 * The live tier of every widget's content prefs: the tab it is on, the filter it
 * is showing, the view mode it is in.
 *
 * A widget is unmounted the moment any screen opens, which is intended, so
 * nothing a widget wants to keep can live in its own component state. It lives
 * here, where it outlasts the unmount, and is written through to the profile so
 * it also outlasts the app. Same reasoning as navigation-overlay-store, applied
 * to all of them instead of one.
 */
import { create } from 'zustand';
import { patchWidgetBlob } from '@app/lib/storage/widget-state';
import { WIDGET_PREFS_VERSION } from '@app/lib/storage/widget-prefs';
import type { WidgetPrefs } from '@app/lib/storage/widget-prefs';

interface WidgetUiStoreState {
  /** The profile these prefs belong to; writes are dropped until one is known. */
  profileId: string | null;
  /**
   * False until the profile's saved prefs have arrived. A consumer that has to
   * apply a pref exactly once (the navigation mode) waits on this, so it applies
   * the saved value and not the fallback that preceded it.
   */
  hydrated: boolean;
  byWidget: Readonly<Record<string, WidgetPrefs>>;
  /** Replaces everything with what the profile had saved. */
  hydrate: (profileId: string, byWidget: Readonly<Record<string, WidgetPrefs>>) => void;
  /** Updates one key of one widget and writes the whole set back to the profile. */
  setPref: (widgetId: string, key: string, value: unknown) => void;
}

const useWidgetUiStore = create<WidgetUiStoreState>((set, get) => ({
  profileId: null,
  hydrated: false,
  byWidget: {},

  hydrate: (profileId, byWidget) => set({ profileId, byWidget, hydrated: true }),

  setPref: (widgetId, key, value) => {
    const { profileId, byWidget } = get();
    const next = { ...byWidget, [widgetId]: { ...byWidget[widgetId], [key]: value } };
    set({ byWidget: next });
    if (profileId) patchWidgetBlob(profileId, { widgetUi: { v: WIDGET_PREFS_VERSION, byWidget: next } });
  },
}));

export { useWidgetUiStore };
