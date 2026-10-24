/* @layer renderer-components @kind constants */
import type { ControllerSlotId } from '@drizztdourden08/brock-input/renderer';
import type { OverlayPartKind } from './PadOverlay.type';

const DIRECTION_NAMES = { up: 'Up', right: 'Right', down: 'Down', left: 'Left' } as const;

const GLYPH_REACH: Readonly<Record<OverlayPartKind, number>> = { button: 1.15, analog: 1.15, stick: 1.1, dpad: 1.1 };

const DETAIL_SAMPLES: Readonly<Record<OverlayPartKind, string>> = {
  button: '', analog: '100%', stick: '-0.00, -0.00', dpad: 'Down + Right',
};

const FRAME_PAD = 8;
const LEADER_GAP = 2;
const HALO_PAD = 3;
const DETAIL_LINE_RATIO = 1.15;
const STACKED_WIN = 1.05;
const GLYPH_MARGIN = 4;
const LABEL_PAD = 3;
const LABEL_GAP = 12;
const ATTACH_GAP = 3;
const LEADER_SPACING = 3;
const BEND_COST = 14;
const MIDDLE_COST = 30;
const MIDDLE_REACH = 3;
const MIDDLE_STEP_RATIO = 2.5;
const OPTION_LIMIT = 48;
const LABEL_LINE_RATIO = 1.3;
const CURVE_STEPS = 8;
const SEARCH_STEPS = 8;
const SCALE_STEP = 0.1;
const REFINE_STEPS = 3;
const SEARCH_BRANCH = 5;
const RESIZE_SETTLE_MS = 80;
const LAYOUT_CACHE_SIZE = 24;
const LAYOUT_DELAY_MS = 0;
const SEARCH_BUDGET = 150;
const MIN_SCALE_RATIO = 0.25;
const GROW_ROWS = 6;
const GROW_EXTRA_ROWS = 2;
const GROWN_SLACK = 1;

const STICK_CAP_RATIO = 0.6;
const STICK_WELL_GAP = 0.06;
const STICK_TICK_FROM = 0.55;
const STICK_TICK_TO = 0.88;
const STICK_MARKS: Readonly<Partial<Record<ControllerSlotId, string>>> = { 'stick.left': 'L', 'stick.right': 'R' };
const STICK_ACTIVE_DEFLECTION = 0.15;
const DEGREES_PER_RADIAN = 180 / Math.PI;
const DETAIL_DECIMALS = 2;
const FALLBACK_FONT_PX = 14;
const CHAR_WIDTH_RATIO = 0.6;

export {
  ATTACH_GAP, BEND_COST, CHAR_WIDTH_RATIO, CURVE_STEPS, DEGREES_PER_RADIAN, DETAIL_DECIMALS, DETAIL_LINE_RATIO, DETAIL_SAMPLES, DIRECTION_NAMES, FALLBACK_FONT_PX,
  FRAME_PAD, GLYPH_MARGIN, GLYPH_REACH, GROW_EXTRA_ROWS, GROW_ROWS, GROWN_SLACK, HALO_PAD, LAYOUT_CACHE_SIZE, LAYOUT_DELAY_MS, RESIZE_SETTLE_MS, LABEL_GAP, LABEL_LINE_RATIO, LABEL_PAD, LEADER_GAP, LEADER_SPACING, MIDDLE_COST,
  MIDDLE_REACH, MIDDLE_STEP_RATIO, MIN_SCALE_RATIO, OPTION_LIMIT, REFINE_STEPS, SCALE_STEP, SEARCH_BRANCH, SEARCH_BUDGET, SEARCH_STEPS, STACKED_WIN, STICK_ACTIVE_DEFLECTION,
  STICK_CAP_RATIO, STICK_MARKS, STICK_TICK_FROM, STICK_TICK_TO, STICK_WELL_GAP,
};
