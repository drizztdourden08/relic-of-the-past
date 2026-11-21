/* @layer shared-game @kind types */
import type { LetterRecipe, MarkArt, OverlayId } from '../latin-letters.type';
import type { MaskBox } from '../mask/mask.type';

type MarkStep = { kind: 'art'; art: MarkArt } | { kind: 'overlay'; overlay: OverlayId };

type MarksRecipe = Extract<LetterRecipe, { kind: 'marks' }>;

type Point = readonly [number, number];

type PointsOf = (mask: Uint8Array, box: MaskBox) => Point[] | undefined;

type Placed = readonly [number, number] | undefined;

interface PlaceSpot {
  mask: Uint8Array;
  box: MaskBox;
  w: number;
  h: number;
  strict: boolean;
}

export type { MarkStep, MarksRecipe, PlaceSpot, Placed, Point, PointsOf };
