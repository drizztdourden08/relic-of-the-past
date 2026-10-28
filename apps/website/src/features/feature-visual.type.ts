/* @layer website-site @kind types */
import type { Callout } from './callout.type';
import type { Screenshot } from './screenshot.type';

type Depth = 'back' | 'mid' | 'front';

type CollageSlot = 'main' | 'top-right' | 'bottom-left' | 'bottom-right';

type CollageLayer = { shot: Screenshot; slot: CollageSlot; depth: Depth; callouts?: readonly Callout[] };

type RatioFrame = { label: string; shot: Screenshot };

type VideoClip = { src: string; poster: Screenshot };

type ClipPair = { before: VideoClip; after: VideoClip };

type PickerOption = { id: string; name: string; before: Screenshot; after: Screenshot; clips?: ClipPair };

type TitleVariant = { id: string; name: string; video: VideoClip; thumb: Screenshot };

type GameIcon = { id: string; name: string; src: string };

type FeatureVisual =
  | { kind: 'single'; shot: Screenshot }
  | {
      kind: 'compare';
      before: Screenshot;
      after: Screenshot;
      labels: readonly [string, string];
      axis: 'x' | 'y';
      clips?: ClipPair;
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
  | { kind: 'title'; variants: readonly [TitleVariant, ...TitleVariant[]] }
  | { kind: 'video'; video: VideoClip; sound?: boolean }
  | { kind: 'cloud'; words: readonly [string, ...string[]] }
  | { kind: 'icons'; icons: readonly [GameIcon, ...GameIcon[]] };

export type { ClipPair, CollageLayer, CollageSlot, Depth, FeatureVisual, GameIcon, PickerOption, RatioFrame, TitleVariant, VideoClip };
