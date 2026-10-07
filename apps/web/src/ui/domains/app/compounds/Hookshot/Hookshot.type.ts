/* @layer renderer-components @kind types */
type Point = readonly [number, number];

/** A cubic Bezier in mascot pixels. The chain runs from its first point to its last. */
type HookshotCurve = readonly [Point, Point, Point, Point];

type SpriteName = 'handle' | 'linkFace' | 'linkEdge' | 'head';

/** One sprite in place, in mascot pixels: its box, and its turn around an origin inside that box. */
type PlacedSprite = {
  sprite: SpriteName;
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  originX: number;
  originY: number;
};

type HookshotLayout = {
  /** Face-on links first, then the edge-on links that pass through them. */
  links: PlacedSprite[];
  handle: PlacedSprite;
  head: PlacedSprite;
  /** Where the head's point lands, in mascot pixels. */
  tip: Point;
};

interface HookshotProps {
  /** The path the chain follows. The handle's muzzle sits on its start, the head's back on its end. */
  curve: HookshotCurve;
  /** Only the part inside this polygon shows, in mascot pixels. The head can vanish behind something this way. */
  clip?: readonly Point[];
  className?: string;
}

export type { Point, HookshotCurve, SpriteName, PlacedSprite, HookshotLayout, HookshotProps };
