/* @layer website-site @kind types */
import type { Callout } from './callout.type';
import type { Screenshot } from './screenshot.type';

type Depth = 'back' | 'mid' | 'front';

type CollageSlot = 'main' | 'top-right' | 'bottom-left' | 'bottom-right';

type CollageLayer = { shot: Screenshot; slot: CollageSlot; depth: Depth; callouts?: readonly Callout[] };

type Frame = { x: number; y: number; width: number; height: number };

type FeatureVisual =
  | { kind: 'single'; shot: Screenshot }
  | {
      kind: 'compare';
      before: Screenshot;
      after: Screenshot;
      labels: readonly [string, string];
      axis: 'x' | 'y';
      insets?: readonly Screenshot[];
    }
  | { kind: 'overlay'; wide: Screenshot; original: Screenshot; frame: Frame; ratios: readonly string[] }
  | { kind: 'lens'; shot: Screenshot; lens: { x: number; y: number }; before: Screenshot; after: Screenshot }
  | { kind: 'collage'; layers: readonly [CollageLayer, CollageLayer, ...CollageLayer[]] }
  | { kind: 'pins'; shot: Screenshot; callouts: readonly Callout[] }
  | { kind: 'clip'; poster: Screenshot; loop: Screenshot; after: Screenshot };

export type { Depth, FeatureVisual, Frame };
