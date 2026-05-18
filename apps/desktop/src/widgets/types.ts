/**
 * Widget Window System — Type definitions & persistence.
 *
 * Widgets are independent panels that can be docked (stacked on screen edges)
 * or floated freely. Each widget has its own transparency, size, and visibility settings.
 * Layout is persisted per profile.
 */

// ─── Snap sides ───

/** Docking sides: left/right stack vertically, top/bottom stack horizontally */
export type SnapSide = 'left' | 'right' | 'top' | 'bottom';
export type WidgetMode = 'docked' | 'floating';

/** When the widget should be visible */
export type WidgetVisibility = 'always' | 'game-only';

// ─── Per-widget state ───

export interface WidgetState {
  id: string;              // Unique widget ID (e.g. 'inventory', 'checks', 'logs')
  mode: WidgetMode;
  side: SnapSide;          // Relevant when docked
  order: number;           // Stacking order within the same side (0-based)
  opacity: number;         // 0.0–1.0, affects frame only (bg/border/shadow)
  visibility: WidgetVisibility;
  visible: boolean;        // Whether the widget is currently open

  // Floating geometry (pixels)
  x: number;
  y: number;
  width: number;
  height: number;

  // Docked size: width for left/right, height for top/bottom
  dockedSize: number;
}

// ─── Registry (full layout) ───

export interface WidgetLayout {
  widgets: WidgetState[];
}

// ─── Widget definition (static registration) ───

export interface WidgetDefinition {
  id: string;
  label: string;
  defaultVisibility: WidgetVisibility;
  defaultSide: SnapSide;
  defaultDockedSize: number;
  defaultFloatingSize: { width: number; height: number };
}

// ─── Defaults ───

export const createDefaultWidgetState = (def: WidgetDefinition, order = 0): WidgetState => {
  return {
    id: def.id,
    mode: 'docked',
    side: def.defaultSide,
    order,
    opacity: 0.92,
    visibility: def.defaultVisibility,
    visible: false,
    x: 100 + order * 30,
    y: 100 + order * 30,
    width: def.defaultFloatingSize.width,
    height: def.defaultFloatingSize.height,
    dockedSize: def.defaultDockedSize,
  };
}

// ─── Widget Registry (known widgets) ───

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  {
    id: 'inventory',
    label: 'Inventory',
    defaultVisibility: 'game-only',
    defaultSide: 'right',
    defaultDockedSize: 320,
    defaultFloatingSize: { width: 320, height: 280 },
  },
  {
    id: 'checks',
    label: 'Checks',
    defaultVisibility: 'game-only',
    defaultSide: 'right',
    defaultDockedSize: 380,
    defaultFloatingSize: { width: 380, height: 500 },
  },
  {
    id: 'logs',
    label: 'Logs',
    defaultVisibility: 'always',
    defaultSide: 'bottom',
    defaultDockedSize: 180,
    defaultFloatingSize: { width: 600, height: 220 },
  },
];

export const getWidgetDefinition = (id: string): WidgetDefinition | undefined => {
  return WIDGET_DEFINITIONS.find((d) => d.id === id);
}

export const createDefaultLayout = (): WidgetLayout => {
  return {
    widgets: WIDGET_DEFINITIONS.map((def, i) => createDefaultWidgetState(def, i)),
  };
}
