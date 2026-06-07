/* @layer renderer-components @kind types */
/**
 * Widget Window System — Type definitions.
 */

// ─── Snap sides ───

/** Docking sides: left/right stack vertically, top/bottom stack horizontally */
type SnapSide = 'left' | 'right' | 'top' | 'bottom';
type WidgetMode = 'docked' | 'floating';

/** When the widget should be visible */
type WidgetVisibility = 'always' | 'game-only';

// ─── Per-widget state ───

interface WidgetState {
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

  /** When true AND docked, the game viewport shrinks to avoid this widget's space */
  exclusive: boolean;
}

// ─── Registry (full layout) ───

interface WidgetLayout {
  widgets: WidgetState[];
}

// ─── Widget definition (static registration) ───

interface WidgetDefinition {
  id: string;
  label: string;
  defaultVisibility: WidgetVisibility;
  defaultSide: SnapSide;
  defaultDockedSize: number;
  defaultFloatingSize: { width: number; height: number };
}

export type {
  SnapSide,
  WidgetDefinition,
  WidgetLayout,
  WidgetMode,
  WidgetState,
  WidgetVisibility
};
