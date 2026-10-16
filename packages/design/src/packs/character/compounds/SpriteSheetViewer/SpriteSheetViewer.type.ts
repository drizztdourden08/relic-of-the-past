/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { OutfitId, PlayerSheet } from '@rotp/game-data';
import type { WearingState } from '../../behavior/useWearing';
import type { AnimationClock } from '../../behavior/animation-clock.type';
import type { useSpriteViewer } from './behavior/useSpriteViewer';

type SheetView = 'state' | 'contact' | 'sheet';

type SpriteSheetViewerProps = {
  sheet: PlayerSheet;
  wearing?: WearingState;
  aside?: ReactNode;
  className?: string;
};

type SpriteViewerParams = {
  setOutfit: (outfit: OutfitId) => void;
};

type SpriteViewerModel = ReturnType<typeof useSpriteViewer>;

type ViewerControlsProps = {
  view: SheetView;
  clock: AnimationClock;
  scale: number;
  onView: (view: SheetView) => void;
  onScale: (scale: number) => void;
};

type ViewSwitchProps = {
  view: SheetView;
  onView: (view: SheetView) => void;
};

type PlaybackControlsProps = {
  clock: AnimationClock;
};

type ZoomControlProps = {
  scale: number;
  onScale: (scale: number) => void;
};

type ViewerStageProps = {
  sheet: PlayerSheet;
  wearing: WearingState;
  viewer: SpriteViewerModel;
};

export type {
  PlaybackControlsProps, SheetView, SpriteSheetViewerProps, SpriteViewerModel, SpriteViewerParams, ViewerControlsProps,
  ViewerStageProps, ViewSwitchProps, ZoomControlProps,
};
