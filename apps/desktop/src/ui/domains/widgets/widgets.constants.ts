/* @layer renderer-widgets @kind constants */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { InventoryWidgetContent, InventoryWidgetSettings } from './inventory';
import { ChecksWidgetContent, ChecksWidgetSettings } from './checks';
import { LogsWidgetContent } from './logs';
import { DebugWidgetContent } from './debug';
import { NavigationWidgetContent, NavigationWidgetSettings, LiveDataInspectorContent } from './navigation';
import { CheatsWidgetContent } from './cheats';
import { SimulatorWidgetContent, SimulatorWidgetSettings } from './simulator';
import { MusicWidgetContent } from './music';

const WIDGET_CONTENT: Record<string, ReactNode> = {
  inventory: createElement(InventoryWidgetContent),
  checks: createElement(ChecksWidgetContent),
  logs: createElement(LogsWidgetContent),
  debug: createElement(DebugWidgetContent),
  navigation: createElement(NavigationWidgetContent),
  dataset: createElement(LiveDataInspectorContent),
  cheats: createElement(CheatsWidgetContent),
  simulator: createElement(SimulatorWidgetContent),
  music: createElement(MusicWidgetContent),
};

const WIDGET_SETTINGS_CONTENT: Record<string, ReactNode> = {
  inventory: createElement(InventoryWidgetSettings),
  checks: createElement(ChecksWidgetSettings),
  navigation: createElement(NavigationWidgetSettings),
  simulator: createElement(SimulatorWidgetSettings),
};

export { WIDGET_CONTENT, WIDGET_SETTINGS_CONTENT };
