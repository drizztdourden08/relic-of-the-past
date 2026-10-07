/* @layer renderer-components @kind data */
/**
 * Each widget's own OptionRows, keyed by widget id, so the host renders them
 * inside the standard options panel without knowing each settings file. A
 * widget with no entry gets the built-in rows only.
 */
import type { ReactNode } from 'react';
import { InventoryWidgetSettings } from './inventory';
import { ChecksWidgetSettings } from './checks';
import { NavigationWidgetSettings } from './navigation';
import { SimulatorWidgetSettings } from './simulator';

const WIDGET_SETTINGS_CONTENT: Record<string, ReactNode> = {
  inventory: <InventoryWidgetSettings />,
  checks: <ChecksWidgetSettings />,
  navigation: <NavigationWidgetSettings />,
  simulator: <SimulatorWidgetSettings />,
};

export { WIDGET_SETTINGS_CONTENT };
