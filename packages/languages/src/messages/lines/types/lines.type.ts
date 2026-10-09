/* @layer shared-game @kind types */
import type { Token } from '../../types';

type LineAdvance =
  | { kind: 'row'; row: 1 | 2 | 3 }
  | { kind: 'scroll' }
  | null;

type DialogueLineView = {
  index: number;
  box: number;
  row: number;
  advance: LineAdvance;
  tokens: Token[];
  endsBox: boolean;
  widthPx: number;
  count: number;
  overflow: boolean;
  freePx: number;
};

type LineMetrics = {
  widthPx: number;
  count: number;
  overflow: boolean;
  freePx: number;
};

type LineDraft = {
  advance: LineAdvance;
  tokens: Token[];
  endsBox: boolean;
};

export type { DialogueLineView, LineAdvance, LineDraft, LineMetrics };
