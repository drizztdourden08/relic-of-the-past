/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { PlayerSheet } from '@shared/game/data/player-sheet/types';
import type { WearingState } from '../../behavior/useWearing';
import type { AnimationClock } from '../../behavior/useAnimationClock.type';

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
