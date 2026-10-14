/* @layer renderer-hud @kind types */
import type { BoxPlacement, DialogBorder, DialogFrame } from '@rotp/game-data';
import type { activeAlphabet, getGlyphAtlas } from '@rotp/game-core';
import type { CssRect } from '../../compounds/DialogBox';
import type { ResolvedPrompt } from '../../compounds/DialogPrompts';

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

interface ShownFrame {
  frame: DialogFrame;
  fade: FadePresence;
}

interface DialogChrome {
  openingMessage: number;
  spawnPicker: boolean;
  borderKind: DialogBorder;
  padX: number;
  padY: number;
  native: boolean;
}

interface Grounding {
  grounded: boolean;
  feathered: boolean;
}

interface DialogContent {
  atlas: ReturnType<typeof getGlyphAtlas>;
  alphabet: ReturnType<typeof activeAlphabet>;
  highlight: HighlightLook;
  spritesBase: string;
  prompts: ResolvedPrompt[];
  itemSprite: string | null;
}

export type { DialogChrome, DialogContent, DialogGeometry, DialogScale, Grounding, ShownFrame, FadePresence, GeometryOptions, HighlightLook, HighlightLookParams };
