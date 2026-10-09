/* @layer renderer-components @kind types */
import type { HookshotCurve } from '../Hookshot';

type Point = readonly [number, number];

type PartName = 'bot' | 'bag' | 'stamp' | 'sparkle' | 'star' | 'speedLine';

type SpriteName = Exclude<PartName, 'bot'>;

type PartSize = { readonly w: number; readonly h: number; readonly scale: number };

type HookshopParts = {
  readonly bot: PartSize & { readonly pod: Point };
  readonly bag: PartSize & {
    readonly catch: Point;
    readonly stampCentre: Point;
    readonly stampAngle: number;
    readonly frontEdge: readonly [Point, Point];
  };
  readonly stamp: PartSize;
  readonly sparkle: PartSize;
  readonly star: PartSize;
  readonly speedLine: PartSize;
};

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
  hookshot: HookshotCurve;
  hookshotClip: Point[];
  behindBag: PlacedPart<'star'>[];
  bag: PlacedPart;
  stamp: PlacedPart;
  effects: PlacedPart<'sparkle' | 'speedLine'>[];
};

type BagEffects = { stars: PlacedPart<'star'>[]; speedLines: PlacedPart<'speedLine'>[] };

interface HookshopHighlightProps {
  pixelSize?: number;
  className?: string;
}

export type {
  BagEffects, Point, PartName, PartSize, HookshopParts, PlacedPart, HookshopLayout, HookshopHighlightProps, SpriteName,
};
