/* @layer renderer-stores @kind types */
import type { WidgetPrefs } from '@app/lib/storage/widget-prefs';

interface WidgetUiStoreState {
  profileId: string | null;
  hydrated: boolean;
  byWidget: Readonly<Record<string, WidgetPrefs>>;
  hydrate: (profileId: string, byWidget: Readonly<Record<string, WidgetPrefs>>) => void;
  setPref: (widgetId: string, key: string, value: unknown) => void;
}

export type { WidgetUiStoreState };
