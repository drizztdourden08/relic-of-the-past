/* @layer renderer-lib @kind types */
import type { WIDGET_PREFS_VERSION } from './widget-prefs.constants';

type WidgetPrefs = Readonly<Record<string, unknown>>;

interface WidgetUiState {
  v: typeof WIDGET_PREFS_VERSION;
  byWidget: Readonly<Record<string, WidgetPrefs>>;
}

export type { WidgetPrefs, WidgetUiState };
