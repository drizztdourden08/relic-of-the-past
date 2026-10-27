/* @layer website-site @kind types */
import type { Callout } from './callout.type';
import type { Screenshot } from './screenshot.type';

type Depth = 'back' | 'mid' | 'front';

type CollageSlot = 'main' | 'top-right' | 'bottom-left' | 'bottom-right';

type CollageLayer = { shot: Screenshot; slot: CollageSlot; depth: Depth; callouts?: readonly Callout[] };

type RatioFrame = { label: string; shot: Screenshot };

type PickerOption = { id: string; name: string; before: Screenshot; after: Screenshot };

type TitleVideo = { src: string; poster: Screenshot };

type GameIcon = { id: string; name: string; src: string };

type FeatureVisual =
  | { kind: 'single'; shot: Screenshot }
  | {
      kind: 'compare';
      before: Screenshot;
      after: Screenshot;
      labels: readonly [string, string];
      axis: 'x' | 'y';
    }
  | {
      kind: 'picker';
      labels: readonly [string, string];
      axis: 'x' | 'y';
      focus: 'center' | 'bottom';
      options: readonly [PickerOption, ...PickerOption[]];
    }
  | { kind: 'ratios'; frames: readonly [RatioFrame, ...RatioFrame[]] }
  | { kind: 'lens'; shot: Screenshot; lens: { x: number; y: number }; before: Screenshot; after: Screenshot }
  | { kind: 'collage'; layers: readonly [CollageLayer, CollageLayer, ...CollageLayer[]] }
  | { kind: 'pins'; shot: Screenshot; callouts: readonly Callout[] }
  | { kind: 'title'; video: TitleVideo; swords: readonly Screenshot[] }
  | { kind: 'icons'; icons: readonly [GameIcon, ...GameIcon[]] };

export type { Depth, FeatureVisual, GameIcon, PickerOption, RatioFrame, TitleVideo };
