/* @layer renderer-components @kind types */
type Point = readonly [number, number];

type PieceName = 'body' | 'visor' | 'eye' | 'podLeft' | 'podRight';

/** One piece in place, in mascot pixels: its box, and its turn around an origin inside that box. */
type PlacedPiece = {
  piece: PieceName;
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  originX: number;
  originY: number;
};

type PodAngles = { readonly left?: number; readonly right?: number };

interface MascotProps {
  /** Where the eyes look, in mascot pixels from centre: x from -2 to 2, y from -1 to 1. */
  look?: Point;
  /** How far each pod is turned around the point where it meets the body, in degrees. */
  podAngles?: PodAngles;
  className?: string;
}

export type { Point, PieceName, PlacedPiece, PodAngles, MascotProps };
