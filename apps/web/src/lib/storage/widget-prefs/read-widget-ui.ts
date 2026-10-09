/* @layer renderer-lib @kind logic */
import type { WidgetUiState } from './widget-prefs.type';
import { sanitizeWidgetUi } from './sanitize-widget-ui';

const readWidgetUi = (blob: Record<string, unknown> | null): WidgetUiState =>
  sanitizeWidgetUi(blob?.widgetUi);

export { readWidgetUi };
