/* @layer renderer-widgets @kind data */
/**
 * Every widget's content by id, for whichever shell draws it: the dock in the
 * main window, or a widget's own window. The ids are WIDGET_DEFINITIONS'.
 */
import type { ReactNode } from 'react';
import { InventoryWidgetContent } from './inventory';
import { ChecksWidgetContent } from './checks';
import { LogsWidgetContent } from './logs';
import { DebugWidgetContent } from './debug';
import { NavigationWidgetContent, LiveDataInspectorContent } from './navigation';
import { CheatsWidgetContent } from './cheats';
import { SimulatorWidgetContent } from './simulator';
import { MusicWidgetContent } from './music';

const WIDGET_CONTENT: Record<string, ReactNode> = {
  inventory: <InventoryWidgetContent />,
  checks: <ChecksWidgetContent />,
  logs: <LogsWidgetContent />,
  debug: <DebugWidgetContent />,
  navigation: <NavigationWidgetContent />,
  dataset: <LiveDataInspectorContent />,
  cheats: <CheatsWidgetContent />,
  simulator: <SimulatorWidgetContent />,
  music: <MusicWidgetContent />,
};

export { WIDGET_CONTENT };
