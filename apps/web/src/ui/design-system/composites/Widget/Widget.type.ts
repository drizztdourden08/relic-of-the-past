/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import type { DockEdge, PinMode, Rect, WidgetId } from '@shared/types/widget-layout';

/** When the widget should be visible */
type WidgetVisibility = 'always' | 'game-only';

/** The edge a widget definition docks to by default. */
type SnapSide = DockEdge;

interface WidgetTab {
  id: WidgetId;
  label: string;
}

interface WidgetProps {
  id: WidgetId;
  /** One entry for a plain widget; several when the pane holds tabs. */
  tabs: WidgetTab[];
  activeId: WidgetId;
  /** Null while floating or popped. */
  paneKey: string | null;
  /** Frame only, 0..1. */
  opacity: number;
  /** Folded to its title strip. */
  peek?: boolean;
  /** The gear shows pressed. */
  optionsOpen?: boolean;
  onActivateTab: (id: WidgetId) => void;
  /** The gear button's viewport rect, for the options panel to anchor on. */
  onOpenOptions: (anchor: Rect) => void;
  /** Inside the app it pops the widget out; in its own window it pops it back in. */
  onPopOut: () => void;
  /** False hides the pop-out action: the widget's content cannot run away from the core. */
  canPopOut?: boolean;
  /** 'out' draws the shell as a whole window: a pop-in button and a pin. Default 'in'. */
  mode?: 'in' | 'out';
  /** Own-window only: the pin mode shown, and whether the window is on top right now. */
  pin?: PinMode;
  onTop?: boolean;
  /** Own-window only: the pin button asks for the next mode. */
  onPinChange?: (mode: PinMode) => void;
  onClose: () => void;
  children: ReactNode;
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
   *  game computes. When Vanilla Safe is on, the host covers these with a DisabledOverlay
   *  instead of hiding them, which is what devOnly does. See the Vanilla Safe plan. */
  readsGameData?: boolean;
  /** A GameSettings key that must be truthy for this widget to do anything useful (e.g. the
   *  Cheats widget needs `cheatsEnabled`). When off, the host covers the widget with a
   *  DisabledOverlay the same way readsGameData does for Vanilla Safe: visible, inert, and
   *  linking back to the setting that would re-enable it. */
  requiresSetting?: keyof GameSettings;
  /** Can live in its own OS window: its content reads only what the relay carries
   *  (the tracker sets, the log), never the core directly. */
  popOut?: boolean;
}

export type {
  SnapSide,
  WidgetDefinition,
  WidgetProps,
  WidgetTab,
  WidgetVisibility,
};
