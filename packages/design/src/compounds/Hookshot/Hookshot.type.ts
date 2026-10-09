/* @layer renderer-components @kind types */
type Point = readonly [number, number];

type HookshotCurve = readonly [Point, Point, Point, Point];

type SpriteName = 'handle' | 'linkFace' | 'linkEdge' | 'head';

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
  links: PlacedSprite[];
  handle: PlacedSprite;
  head: PlacedSprite;
  tip: Point;
};

interface HookshotProps {
  curve: HookshotCurve;
  clip?: readonly Point[];
  className?: string;
}

export type { Point, HookshotCurve, SpriteName, PlacedSprite, HookshotLayout, HookshotProps };
