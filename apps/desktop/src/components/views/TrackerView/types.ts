/* @layer renderer-components @kind types */
import type { ReactNode, MouseEvent } from 'react';

type PanelSide = 'left' | 'right';
type PanelMode = 'docked' | 'floating';

interface PanelSettings {
  mode: PanelMode;
  side: PanelSide;
  opacity: number;
  x: number;
  y: number;
}

interface TrackerLayoutSettings {
  /** Are inventory and checks in the same panel? */
  combined: boolean;
  /** Settings for the combined panel, or inventory panel when split */
  inventory: PanelSettings;
  /** Settings for the checks panel when split */
  checks: PanelSettings;
}

interface PanelHeaderProps {
  title: string;
  panelSettings: PanelSettings;
  onSettingsChange: (updater: (p: PanelSettings) => PanelSettings) => void;
  onClose: () => void;
  onPopOut?: () => void;
  onDock?: () => void;
  showPopOut?: boolean;
  onMouseDown?: (e: MouseEvent) => void;
}

interface TrackerPanelProps {
  panelSettings: PanelSettings;
  children: ReactNode;
  className?: string;
  onDragStart?: (e: MouseEvent) => void;
}

interface TrackerViewProps {
  visible: boolean;
  onClose: () => void;
}

export type {
  PanelSide,
  PanelMode,
  PanelSettings,
  TrackerLayoutSettings,
  PanelHeaderProps,
  TrackerPanelProps,
  TrackerViewProps,
};
