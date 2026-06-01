import type { WidgetDefinition, WidgetVisibility, SnapSide } from './types';

/** Pixels reserved for the app titlebar */
const TITLEBAR_HEIGHT = 38;

/** Position options for the settings segmented control */
const POSITION_OPTIONS: { value: 'left' | 'right' | 'top' | 'bottom' | 'float'; label: string }[] = [
  { value: 'left', label: '◧' },
  { value: 'right', label: '◨' },
  { value: 'top', label: '▽' },
  { value: 'bottom', label: '△' },
  { value: 'float', label: '⊡' },
];

/** Static registry of all known widget definitions */
const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  {
    id: 'inventory',
    label: 'Inventory',
    defaultVisibility: 'game-only' as WidgetVisibility,
    defaultSide: 'right' as SnapSide,
    defaultDockedSize: 320,
    defaultFloatingSize: { width: 320, height: 280 },
  },
  {
    id: 'checks',
    label: 'Checks',
    defaultVisibility: 'game-only' as WidgetVisibility,
    defaultSide: 'right' as SnapSide,
    defaultDockedSize: 380,
    defaultFloatingSize: { width: 380, height: 500 },
  },
  {
    id: 'logs',
    label: 'Logs',
    defaultVisibility: 'always' as WidgetVisibility,
    defaultSide: 'bottom' as SnapSide,
    defaultDockedSize: 180,
    defaultFloatingSize: { width: 600, height: 220 },
  },
  {
    id: 'debug',
    label: 'Debug',
    defaultVisibility: 'game-only' as WidgetVisibility,
    defaultSide: 'right' as SnapSide,
    defaultDockedSize: 320,
    defaultFloatingSize: { width: 340, height: 500 },
  },
  {
    id: 'navigation',
    label: 'Location & Navigation',
    defaultVisibility: 'game-only' as WidgetVisibility,
    defaultSide: 'left' as SnapSide,
    defaultDockedSize: 320,
    defaultFloatingSize: { width: 340, height: 460 },
  },
  {
    id: 'dataset',
    label: 'Dataset & Mapping',
    defaultVisibility: 'game-only' as WidgetVisibility,
    defaultSide: 'left' as SnapSide,
    defaultDockedSize: 300,
    defaultFloatingSize: { width: 320, height: 400 },
  },
  {
    id: 'cheats',
    label: 'Cheats',
    defaultVisibility: 'game-only' as WidgetVisibility,
    defaultSide: 'right' as SnapSide,
    defaultDockedSize: 340,
    defaultFloatingSize: { width: 360, height: 500 },
  },
];

export { POSITION_OPTIONS, TITLEBAR_HEIGHT, WIDGET_DEFINITIONS };
