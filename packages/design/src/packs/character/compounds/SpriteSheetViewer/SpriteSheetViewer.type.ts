/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { PlayerSheet } from '@rotp/game-data';
import type { WearingState } from '../../behavior/useWearing';
import type { AnimationClock } from '../../behavior/animation-clock.type';

type SheetView = 'state' | 'contact' | 'sheet';

type SpriteSheetViewerProps = {
  sheet: PlayerSheet;
  wearing?: WearingState;
  aside?: ReactNode;
  className?: string;
};

type ViewerControlsProps = {
  view: SheetView;
  clock: AnimationClock;
  scale: number;
  onView: (view: SheetView) => void;
  onScale: (scale: number) => void;
};

export type { SheetView, SpriteSheetViewerProps, ViewerControlsProps };
