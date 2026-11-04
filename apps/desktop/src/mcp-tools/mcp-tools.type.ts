/* @layer renderer-app @kind types */
import type { WIDGET_ACTIONS } from './mcp-tools.constants';

type WidgetAction = (typeof WIDGET_ACTIONS)[number];

export type { WidgetAction };
