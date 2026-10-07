/* @layer renderer-components @kind types */
import type { HookshotCurve } from '../Hookshot';

type Point = readonly [number, number];

type PartName = 'bot' | 'bag' | 'stamp' | 'sparkle' | 'star' | 'speedLine';

/** A part's size in its own pixels, and the size of one of those pixels in mascot pixels. */
type PartSize = { readonly w: number; readonly h: number; readonly scale: number };

/** Sizes and anchors of every part, in each part's own pixels (HookshopHighlight.constants.ts). */
type HookshopParts = {
  readonly bot: PartSize & { readonly pod: Point };
  readonly bag: PartSize & {
    readonly catch: Point;
    readonly stampCentre: Point;
    /** The angle of the front face's bottom edge in the bag's pixels; the stamp sits square to it. */
    readonly stampAngle: number;
    readonly frontEdge: readonly [Point, Point];
  };
  readonly stamp: PartSize;
  readonly sparkle: PartSize;
  readonly star: PartSize;
  readonly speedLine: PartSize;
};

/** One part in the composite, in mascot pixels: its box, and its turn around an origin inside that box. */
type PlacedPart<P extends PartName = PartName> = {
  part: P;
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  originX: number;
  originY: number;
};

type HookshopLayout = {
  width: number;
  height: number;
  bot: PlacedPart;
  /** The path of the hookshot's chain, from the handle's muzzle to the head. */
  hookshot: HookshotCurve;
  /** Everything on the near side of the bag's front edge, where the hookshot stays visible. */
  hookshotClip: Point[];
  /** Drawn before the bag, so the bag covers part of them. */
  behindBag: PlacedPart<'star'>[];
  bag: PlacedPart;
  /** Inside the bag's box, so it turns with the bag. */
  stamp: PlacedPart;
  effects: PlacedPart<'sparkle' | 'speedLine'>[];
};

interface HookshopHighlightProps {
  /** Size of one mascot pixel in CSS pixels. */
  pixelSize?: number;
  className?: string;
}

export type { Point, PartName, PartSize, HookshopParts, PlacedPart, HookshopLayout, HookshopHighlightProps };
