/* @layer renderer-lib @kind logic */
import type { WidgetUiState } from './widget-prefs.type';
import { WIDGET_PREFS_VERSION } from './widget-prefs.constants';

const emptyWidgetUi = (): WidgetUiState => ({ v: WIDGET_PREFS_VERSION, byWidget: {} });

export { emptyWidgetUi };
