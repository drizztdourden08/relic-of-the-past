/* @layer shared-game @kind types */
import type { RowFit } from '../types';

type Run = {
  glyphs: number[];
  offsets: number[];
  widthPx: number;
};

type BoxRow = Run & {
  drawn: boolean;
  stale: Run | null;
};

type Pen = {
  row: number;
  slots: BoxRow[];
  runs: RowFit[];
  unmatched: string[];
  edits: number;
  blankOnJump: boolean;
};

type PenOptions = {
  blankOnJump?: boolean;
};

type TokenEffect = 'none' | 'wait';

export type { BoxRow, Pen, PenOptions, Run, TokenEffect };
