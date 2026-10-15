/* @layer shared-game @kind types */
interface GameRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface BoxLayout {
  frame: GameRect;
  textOrigin: { x: number; y: number };
  textWidth: number;
  visibleRows: number;
}

type BoxSizeMode = 'full' | 'message' | 'fit';
type BoxPlacement = BoxSizeMode | 'native';

interface LayoutOptions {
  mode: BoxPlacement;
  fontScale: number;
  padX: number;
  padY: number;
  messageWidth: number;
  messageRows: number;
}

interface BoxContent {
  width: number;
  rows: number;
}

export type { BoxContent, BoxLayout, BoxPlacement, GameRect, LayoutOptions };
