/* @layer renderer-components @kind types */
import type { GameSettings } from '@shared/types/settings';

/** Docking sides: left/right stack vertically, top/bottom stack horizontally */
type SnapSide = 'left' | 'right' | 'top' | 'bottom';
type WidgetMode = 'docked' | 'floating';

/** When the widget should be visible */
type WidgetVisibility = 'always' | 'game-only';

interface WidgetState {
  id: string;              // Unique widget ID (e.g. 'inventory', 'checks', 'logs')
  mode: WidgetMode;
  side: SnapSide;          // Relevant when docked
  order: number;           // Stacking order within the same side (0-based)
  opacity: number;         // 0.0-1.0, affects frame only (bg/border/shadow)
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

interface WidgetLayout {
  widgets: WidgetState[];
}

interface WidgetDefinition {
  id: string;
  label: string;
  defaultVisibility: WidgetVisibility;
  defaultSide: SnapSide;
  defaultDockedSize: number;
  defaultFloatingSize: { width: number; height: number };
  /** Only ever shown when the developerToolsEnabled setting is on. Mirrors the `mobileOnly`
   *  precedent on ProfileHubTabSpec (ProfileHub.constants.ts). */
  devOnly?: boolean;
  /** Reads live game data, an information advantage even though it never changes what the
   *  game computes. When Vanilla Safe is on, WidgetManager covers these with a
   *  DisabledOverlay instead of hiding them, which is what devOnly does. See the Vanilla
   *  Safe plan. */
  readsGameData?: boolean;
  /** A GameSettings key that must be truthy for this widget to do anything useful (e.g. the
   *  Cheats widget needs `cheatsEnabled`). When off, WidgetManager covers the widget with a
   *  DisabledOverlay the same way readsGameData does for Vanilla Safe: visible, inert, and
   *  linking back to the setting that would re-enable it. */
  requiresSetting?: keyof GameSettings;
}

export type {
  SnapSide,
  WidgetDefinition,
  WidgetLayout,
  WidgetMode,
  WidgetState,
  WidgetVisibility
};
