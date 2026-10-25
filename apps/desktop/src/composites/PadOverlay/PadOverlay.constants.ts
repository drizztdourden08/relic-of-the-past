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
const NAME_LINE_RATIO = 1.2;
const DETAIL_LINE_RATIO = 1.2;
const GLYPH_MARGIN = 4;
const LABEL_PAD = 3;
const LABEL_GAP = 14;
const TEXT_INSET = 2;
const UNDERLINE_GAP = 2;
const LEADER_SPACING = 3;
const BEND_COST = 14;
const BEND_MARGIN = 16;
const END_COST = 20;
const END_REACH = 4;
const END_STEP_RATIO = 2;
const END_ROWS = 3;
const CENTRE_BAND = 0.1;
const HULL_SAMPLES = 12;
const TOWARDS = [-1, 1] as const;
const OPTION_LIMIT = 64;
const CURVE_STEPS = 8;
const SEARCH_STEPS = 8;
const SCALE_STEP = 0.1;
const SEARCH_BRANCH = 5;
const RESIZE_SETTLE_MS = 80;
const LAYOUT_CACHE_SIZE = 24;
const LAYOUT_DELAY_MS = 0;
const SEARCH_BUDGET = 150;
const MIN_SCALE_RATIO = 0.25;
const GROW_ROWS = 3;
const GROW_EXTRA_ROWS = 1;
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
  BEND_COST, BEND_MARGIN, CENTRE_BAND, CHAR_WIDTH_RATIO, CURVE_STEPS, DEGREES_PER_RADIAN, DETAIL_DECIMALS, DETAIL_LINE_RATIO, DETAIL_SAMPLES, DIRECTION_NAMES,
  END_COST, END_REACH, END_ROWS, END_STEP_RATIO, FALLBACK_FONT_PX, FRAME_PAD, GLYPH_MARGIN, GLYPH_REACH, GROW_EXTRA_ROWS, GROW_ROWS, GROWN_SLACK,
  HALO_PAD, HULL_SAMPLES, LABEL_GAP, LABEL_PAD, LAYOUT_CACHE_SIZE, LAYOUT_DELAY_MS, LEADER_GAP, LEADER_SPACING, MIN_SCALE_RATIO, NAME_LINE_RATIO,
  OPTION_LIMIT, RESIZE_SETTLE_MS, SCALE_STEP, SEARCH_BRANCH, SEARCH_BUDGET, SEARCH_STEPS, STICK_ACTIVE_DEFLECTION, STICK_CAP_RATIO, STICK_MARKS,
  STICK_TICK_FROM, STICK_TICK_TO, STICK_WELL_GAP, TEXT_INSET, TOWARDS, UNDERLINE_GAP,
};
