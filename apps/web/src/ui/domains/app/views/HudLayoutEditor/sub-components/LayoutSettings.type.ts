/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { Value } from '@shared/types/hud';

type GapAxis = 'x' | 'y';

interface GapCell {
  axis: GapAxis;
  cap: string;
  label: string;
  value: Value;
}

interface OverlaySide {
  guide: string;
  onGuide: (color: string) => void;
  overlayOn: boolean;
  onToggleOverlay: () => void;
}

interface LayoutSettingsProps {
  engine: 'flex' | 'grid';
  onSetEngine: (next: string) => void;
  overlay: OverlaySide;
  gap: readonly GapCell[];
  onGap: (axis: GapAxis, next: Value) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

interface LayoutSettingsPieceProps { label: string; grow?: boolean; children: ReactNode }

export type { GapAxis, GapCell, LayoutSettingsPieceProps, LayoutSettingsProps, OverlaySide };
