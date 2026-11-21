/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { OutfitId, PlayerSheet } from '@rotp/game-data';
import type { WearingState } from '../../behavior/useWearing';
import type { AnimationClock } from '../../behavior/animation-clock.type';
import type { PoseLabels } from '../../behavior/pose-labels';
import type { useSpriteViewer } from './behavior/useSpriteViewer';

type SheetView = 'state' | 'contact' | 'sheet';

type ViewerLabels = PoseLabels & {
  viewState: string;
  viewContact: string;
  viewSheet: string;
  play: string;
  pause: string;
  step: string;
  fpsAria: string;
  fps: (fps: number) => string;
  zoomAria: string;
  zoom: (zoom: number) => string;
};

type LabelsProp = { labels?: Partial<ViewerLabels> };

type SpriteSheetViewerProps = LabelsProp & {
  sheet: PlayerSheet;
  wearing?: WearingState;
  aside?: ReactNode;
  className?: string;
};

type SpriteViewerParams = {
  setOutfit: (outfit: OutfitId) => void;
};

type SpriteViewerModel = ReturnType<typeof useSpriteViewer>;

type ViewerControlsProps = LabelsProp & {
  view: SheetView;
  clock: AnimationClock;
  scale: number;
  onView: (view: SheetView) => void;
  onScale: (scale: number) => void;
};

type ViewSwitchProps = LabelsProp & {
  view: SheetView;
  onView: (view: SheetView) => void;
};

type PlaybackControlsProps = LabelsProp & {
  clock: AnimationClock;
};

type ZoomControlProps = LabelsProp & {
  scale: number;
  onScale: (scale: number) => void;
};

type ViewerStageProps = LabelsProp & {
  sheet: PlayerSheet;
  wearing: WearingState;
  viewer: SpriteViewerModel;
};

export type {
  PlaybackControlsProps, SheetView, SpriteSheetViewerProps, SpriteViewerModel, SpriteViewerParams, ViewerControlsProps,
  ViewerLabels, ViewerStageProps, ViewSwitchProps, ZoomControlProps,
};
