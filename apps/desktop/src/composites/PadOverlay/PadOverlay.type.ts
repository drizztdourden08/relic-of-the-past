/* @layer renderer-components @kind types */
import type { ControllerSilhouetteAnchorSet } from '@drizztdourden08/tessera/composites';
import type { ControllerSlotId } from '@drizztdourden08/brock-input/renderer';
import type { DpadPressState } from '../DpadCross';

type OverlayPartKind = 'button' | 'analog' | 'stick' | 'dpad';

type LabelSide = 'left' | 'right';

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
  dpad?: DpadPressState;
}

type PadOverlayState = Readonly<Partial<Record<ControllerSlotId, PartState>>>;

interface PadOverlayProps {
  outline: string;
  anchors: ControllerSilhouetteAnchorSet;
  slots: readonly OverlaySlotView[];
  state: PadOverlayState;
  label: string;
  onGrownChange?: (grown: boolean) => void;
}

interface PlacedPart {
  slot: OverlaySlotView;
  x: number;
  y: number;
  radius: number;
}

type TextAnchor = 'start' | 'middle' | 'end';

interface PlacedLabel {
  part: PlacedPart;
  leader: readonly Point[];
  anchor: TextAnchor;
  nameAt: Point;
  detailAt: Point;
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
  scale: number;
  origin: Point;
}

interface OverlayLayout {
  frame: OverlayFrame;
  parts: PlacedPart[];
  labels: PlacedLabel[];
  clear: boolean;
}

interface FittedOverlay {
  layout: OverlayLayout | null;
  grownTo: number;
}

interface AnchorFrame {
  x: number;
  y: number;
  r: number;
}

interface StickCap {
  dx: number;
  dy: number;
  angle: number;
  deflected: boolean;
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
  AnchorFrame, Bounds, BoxSize, FittedOverlay, LabelSide, Nudge, OverlayFrame, OverlayHaloProps, OverlayLabelProps, OverlayLayout,
  OverlayMetrics, OverlayPartKind, OverlaySlotView, PadOverlayProps, PadOverlayState, PartProps, PartState, PlacedLabel,
  PlacedPart, Point, StickCap, TextAnchor, TextMeasure,
};
