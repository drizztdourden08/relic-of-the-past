/* @layer renderer-components @kind types */
import type { Bounds, LabelMode, OverlayFrame, OverlayMetrics, PlacedLabel, PlacedPart, Point, TextAnchor } from '../PadOverlay.type';

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Circle {
  x: number;
  y: number;
  r: number;
}

type Segment = readonly [Point, Point];

interface LabelSpot {
  text: Point;
  anchor: TextAnchor;
  rect: Rect;
  attach: Point;
  middle: boolean;
}

interface LabelOption {
  spot: LabelSpot;
  leader: readonly Point[];
  segments: readonly Segment[];
  cost: number;
}

interface LabelSize {
  w: number;
  h: number;
}

interface Scene {
  frame: OverlayFrame;
  parts: readonly PlacedPart[];
  circles: readonly Circle[];
  outline: readonly Point[];
  edges: readonly Segment[];
  sideEdges: Map<string, SideEdge | null>;
}

interface SideEdge {
  left: number;
  right: number;
}

interface FitInput {
  raw: readonly PlacedPart[];
  bounds: Bounds;
  points: readonly Point[];
  metrics: OverlayMetrics;
  mode: LabelMode;
  sizes: ReadonlyMap<string, LabelSize>;
}

interface Occupied {
  rects: Rect[];
  segments: Segment[];
}

type Choice = LabelOption | null;

type Domains = readonly (readonly LabelOption[] | null)[];

interface Budget {
  left: number;
}

interface Placement {
  labels: PlacedLabel[];
  clear: boolean;
}

export type { Budget, Choice, Circle, Domains, FitInput, LabelOption, LabelSize, LabelSpot, Occupied, Placement, Rect, Scene, Segment, SideEdge };
