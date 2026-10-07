/* @layer renderer-components @kind data */
import type { DockEdge, PinMode, WidgetShow } from './WidgetOptions.type';

/** One placement button: a dock edge, or float when `edge` is null. */
interface PlacementButton {
  edge: DockEdge | null;
  glyph: string;
  label: string;
}

const PLACEMENT_BUTTONS: readonly PlacementButton[] = [
  { edge: 'left', glyph: '◧', label: 'Dock left' },
  { edge: 'right', glyph: '◨', label: 'Dock right' },
  { edge: 'top', glyph: '⬒', label: 'Dock top' },
  { edge: 'bottom', glyph: '⬓', label: 'Dock bottom' },
  { edge: null, glyph: '⊡', label: 'Float' },
];

const PIN_OPTIONS: { value: PinMode; label: string; title: string }[] = [
  { value: 'off', label: 'Off', title: 'Behaves like any window' },
  { value: 'top', label: 'On top', title: 'Always over every other window' },
  { value: 'with-app', label: 'With app', title: 'On top exactly when the app is, and comes forward with it' },
];

const SHOW_OPTIONS: { value: WidgetShow; label: string }[] = [
  { value: 'always', label: 'Always' },
  { value: 'game-only', label: 'Game only' },
];

/** Slider range for the opacity row; the value maps to 0..1 on the way out. */
const OPACITY_MIN = 0;
const OPACITY_MAX = 100;
const OPACITY_STEP = 5;

/** Panel footprint used to keep it inside the viewport. Width matches --widget-options-w. */
const PANEL_WIDTH = 272;
const PANEL_HEIGHT = 470;
const EDGE_MARGIN = 8;
const ANCHOR_GAP = 4;

export {
  ANCHOR_GAP, EDGE_MARGIN, OPACITY_MAX, OPACITY_MIN, OPACITY_STEP, PANEL_HEIGHT, PANEL_WIDTH, PIN_OPTIONS,
  PLACEMENT_BUTTONS, SHOW_OPTIONS,
};
export type { PlacementButton };
