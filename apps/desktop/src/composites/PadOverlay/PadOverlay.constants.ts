/* @layer renderer-components @kind constants */
import type { LabelSide, OverlayPartKind } from './PadOverlay.type';

const LABEL_SIDES: readonly LabelSide[] = ['left', 'right'];

const DIRECTION_NAMES = { up: 'Up', right: 'Right', down: 'Down', left: 'Left' } as const;

const DETAIL_SAMPLES: Readonly<Record<OverlayPartKind, string>> = {
  button: '', analog: '100%', stick: '-0.00, -0.00', dpad: 'Down + Right',
};

const FRAME_PAD = 8;
const ELBOW = 12;
const TEXT_GAP = 4;
const LEADER_GAP = 2;
const HALO_PAD = 3;
const LINE_RATIO = 1.7;
const STACKED_LINE_RATIO = 2.6;
const MIN_LINE_RATIO = 1.2;
const DETAIL_LINE_RATIO = 1.15;
const STACKED_WIN = 1.05;
const CURVE_STEPS = 12;
const SEARCH_STEPS = 14;
const MIN_SCALE_RATIO = 0.25;

const STICK_TRAVEL_RATIO = 0.5;
const STICK_ACTIVE_DEFLECTION = 0.15;
const DETAIL_DECIMALS = 2;
const FALLBACK_FONT_PX = 14;
const CHAR_WIDTH_RATIO = 0.6;

export {
  CHAR_WIDTH_RATIO, CURVE_STEPS, DETAIL_DECIMALS, DETAIL_LINE_RATIO, FALLBACK_FONT_PX, DETAIL_SAMPLES, DIRECTION_NAMES, ELBOW, FRAME_PAD, HALO_PAD, LABEL_SIDES,
  LEADER_GAP, LINE_RATIO, MIN_LINE_RATIO, MIN_SCALE_RATIO, SEARCH_STEPS, STACKED_LINE_RATIO, STACKED_WIN, STICK_ACTIVE_DEFLECTION, STICK_TRAVEL_RATIO, TEXT_GAP,
};
