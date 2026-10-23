/* @layer renderer-components @kind types */
import type { ControllerSlotId } from '@drizztdourden08/tessera/composites';
import type { DpadWedgeState } from '../DpadWedges';

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

interface OverlayAnchor {
  id: ControllerSlotId;
  x: number;
  y: number;
  r: number;
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
  anchors: readonly OverlayAnchor[];
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

interface OverlayBox {
  readonly width: number;
  readonly height: number;
  readonly gutter: number;
  readonly top: number;
  readonly lineH: number;
  readonly minLineH: number;
  readonly centreBand: number;
  readonly elbow: number;
  readonly textGap: number;
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
  AnchorFrame, Leader, LabelSide, Nudge, OverlayAnchor, OverlayBox, OverlayHaloProps, OverlayLabelProps, OverlayPartKind,
  OverlaySlotView, PadOverlayProps, PadOverlayState, PartProps, PartState, PlacedLabel, PlacedLine, PlacedPart, Point,
};
