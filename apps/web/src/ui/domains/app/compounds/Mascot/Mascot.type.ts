/* @layer renderer-components @kind types */
type Point = readonly [number, number];

type PieceName = 'body' | 'visor' | 'eye' | 'podLeft' | 'podRight';

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
  look?: Point;
  podAngles?: PodAngles;
  className?: string;
}

export type { Point, PieceName, PlacedPiece, PodAngles, MascotProps };
