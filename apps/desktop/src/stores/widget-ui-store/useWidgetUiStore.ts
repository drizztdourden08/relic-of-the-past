/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import { patchWidgetBlob } from '@app/lib/storage/widget-state';
import { WIDGET_PREFS_VERSION } from '@app/lib/storage/widget-prefs';
import type { WidgetUiStoreState } from './widget-ui-store.type';

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
