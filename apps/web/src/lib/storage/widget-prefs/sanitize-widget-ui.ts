/* @layer renderer-lib @kind logic */
import type { WidgetPrefs, WidgetUiState } from './widget-prefs.type';
import { WIDGET_PREFS_VERSION } from './widget-prefs.constants';
import { emptyWidgetUi } from './empty-widget-ui';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const sanitizeWidgetUi = (raw: unknown): WidgetUiState => {
  if (!isPlainObject(raw) || raw.v !== WIDGET_PREFS_VERSION || !isPlainObject(raw.byWidget)) {
    return emptyWidgetUi();
  }
  const byWidget: Record<string, WidgetPrefs> = {};
  for (const [id, prefs] of Object.entries(raw.byWidget)) {
    if (isPlainObject(prefs)) byWidget[id] = prefs;
  }
  return { v: WIDGET_PREFS_VERSION, byWidget };
};

export { sanitizeWidgetUi };
