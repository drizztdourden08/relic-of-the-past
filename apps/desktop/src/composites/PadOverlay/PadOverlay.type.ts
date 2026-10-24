/* @layer renderer-components @kind types */
import type { ControllerSilhouetteAnchorSet, ControllerSlotId } from '@drizztdourden08/tessera/composites';
import type { DpadWedgeState } from '../DpadWedges';

type OverlayPartKind = 'button' | 'analog' | 'stick' | 'dpad';

type LabelSide = 'left' | 'right';

type LabelMode = 'inline' | 'stacked';

interface Point {
  x: number;
  y: number;
}

interface Nudge {
  dx: number;
  dy: number;
}

interface Bounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface OverlaySlotView {
  anchor: ControllerSlotId;
  kind: OverlayPartKind;
  glyph: string;
  label: string;
  side?: LabelSide;
  nudge?: Nudge;
  scale?: number;
}

interface PartState {
  pressed?: boolean;
  value?: number;
  x?: number;
  y?: number;
  dpad?: DpadWedgeState;
}

type PadOverlayState = Readonly<Partial<Record<ControllerSlotId, PartState>>>;

interface PadOverlayProps {
  outline: string;
  anchors: ControllerSilhouetteAnchorSet;
  slots: readonly OverlaySlotView[];
  state: PadOverlayState;
  label: string;
}

interface PlacedPart {
  slot: OverlaySlotView;
  x: number;
  y: number;
  radius: number;
}

type Leader = readonly [Point, Point, Point];

interface PlacedLabel {
  part: PlacedPart;
  side: LabelSide;
  text: Point;
  leader: Leader;
  detailDy: number;
}

interface PlacedLine {
  part: PlacedPart;
  y: number;
}

interface AnchorFrame {
  x: number;
  y: number;
  r: number;
}

interface BoxSize {
  width: number;
  height: number;
}

interface TextMeasure {
  name: (text: string) => number;
  detail: (text: string) => number;
}

interface OverlayMetrics {
  width: number;
  height: number;
  fontPx: number;
  measure: TextMeasure;
}

interface OverlayFrame {
  width: number;
  height: number;
  mode: LabelMode;
  scale: number;
  origin: Point;
  top: number;
  bottom: number;
  lineH: number;
  minLineH: number;
  lineGap: number;
  edge: (side: LabelSide, y: number, own: PlacedPart) => number;
}

interface EdgeBand {
  y: number;
  half: number;
  own: PlacedPart;
}

interface LabelSlack {
  left: number;
  right: number;
}

interface FitInput {
  raw: readonly PlacedPart[];
  bounds: Bounds;
  sides: ReadonlyMap<string, LabelSide>;
  points: readonly Point[];
  metrics: OverlayMetrics;
  mode: LabelMode;
  widths: ReadonlyMap<string, number>;
}

interface FramedParts {
  frame: OverlayFrame;
  parts: PlacedPart[];
}

interface OverlayLayout {
  frame: OverlayFrame;
  parts: PlacedPart[];
  labels: PlacedLabel[];
}

interface FitAttempt {
  layout: OverlayLayout;
  fits: boolean;
}

interface PartProps {
  part: PlacedPart;
  state: PartState | undefined;
}

interface OverlayHaloProps {
  part: PlacedPart;
  level: number;
}

interface OverlayLabelProps {
  placed: PlacedLabel;
  detail: string | undefined;
  active: boolean;
}

export type {
  AnchorFrame, Bounds, BoxSize, EdgeBand, FitAttempt, FitInput, FramedParts, LabelSlack, Leader, LabelMode, LabelSide, Nudge, OverlayFrame, OverlayHaloProps, OverlayLabelProps, OverlayLayout,
  OverlayMetrics, OverlayPartKind, OverlaySlotView, PadOverlayProps, PadOverlayState, PartProps, PartState, PlacedLabel,
  PlacedLine, PlacedPart, Point, TextMeasure,
};
