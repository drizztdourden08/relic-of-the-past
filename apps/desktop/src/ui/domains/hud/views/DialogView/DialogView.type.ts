/* @layer renderer-hud @kind types */
import type { BoxPlacement } from '@shared/game/dialog/box-geometry';
import type { DialogFrame } from '@shared/game/dialog/dialog-frame.types';
import type { CssRect } from '../../compounds/DialogBox';

interface DialogGeometry {
  frame: CssRect;
  textOrigin: { x: number; y: number };
  textWidthPx: number;
  visibleRows: number;
  unit: number;
  tile: number;
}

interface GeometryOptions {
  mode: BoxPlacement;
  fontScale: number;
  padX: number;
  padY: number;
  shiftX: number;
  shiftY: number;
}

interface DialogScale {
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface FadePresence {
  mounted: boolean;
  opacity: number;
  transition: string;
}

interface HighlightLookParams {
  frame: DialogFrame;
  primary: string;
  secondary: string;
}

interface HighlightLook {
  atlases: readonly (HTMLCanvasElement | null)[];
  inks: readonly string[];
}

export type { DialogGeometry, DialogScale, FadePresence, GeometryOptions, HighlightLook, HighlightLookParams };
