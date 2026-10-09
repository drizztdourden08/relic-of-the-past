/* @layer renderer-appshell @kind data */
import type { WidgetGate } from './widget-gate.type';

const WIDGET_GATES: Readonly<Record<string, WidgetGate>> = {
  inventory: { readsGameData: true, requiresSetting: 'trackerEnabled' },
  checks: { readsGameData: true, requiresSetting: 'trackerEnabled' },
  debug: { readsGameData: true },
  navigation: { readsGameData: true, requiresSetting: 'devNavigationData' },
  dataset: { readsGameData: true, requiresSetting: 'devNavigationData' },
  cheats: { readsGameData: true, requiresSetting: 'cheatsEnabled' },
  music: {},
  simulator: { readsGameData: true, requiresSetting: 'devNavigationData' },
};

export { WIDGET_GATES };
