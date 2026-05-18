/**
 * Widget Window System — Type definitions.
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

