/* @layer shared-game @kind types */
interface DialogCell {
  glyph: number;
  x: number;
  w: number;
  highlight?: number;
}

type DialogWait = 'none' | 'timed' | 'key' | 'end' | 'choice' | 'item';

type DialogKind = 'box' | 'floating' | 'story' | 'menu';

interface DialogFrame {
  active: boolean;
  kind: DialogKind;
  topleft: number;
  rows: DialogCell[][];
  scrollStep: number;
  wait: DialogWait;
  choice: number;
  messageId: number;
  renderState: number;
  nativeHidden: boolean;
  generation: number;
  layerScrollX: number;
  layerScrollY: number;
  messageWidth: number;
  messageRows: number;
}

export type { DialogCell, DialogFrame, DialogKind, DialogWait };
