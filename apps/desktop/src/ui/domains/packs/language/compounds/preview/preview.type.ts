/* @layer renderer-components @kind types */
import type { Block, BlockDoc, GlossaryTerm, GlyphMetrics, GlyphSheet, LayoutOptions, RowFit } from '@shared/game/language';

type ChoiceKind = 'Choose' | 'Choose2' | 'Choose3';

type PreviewChoice = {
  kind: ChoiceKind;
  rows: number[];
};

type PreviewRow = RowFit & {
  carried: boolean;
};

type PreviewScreen = {
  index: number;
  ends: Block['ends'];
  rows: PreviewRow[];
  choice: PreviewChoice | null;
};

type ScreenParams = {
  doc: BlockDoc;
  metrics: GlyphMetrics;
  terms: GlossaryTerm[];
  opts?: LayoutOptions;
};

type ChoiceCursorProps = {
  sheet: GlyphSheet | null;
  metrics: GlyphMetrics | null;
};

type GlyphRowProps = {
  row: PreviewRow;
  sheet: GlyphSheet | null;
  metrics: GlyphMetrics | null;
};

type PreviewBoxProps = {
  rows: PreviewRow[];
  sheet: GlyphSheet | null;
  metrics: GlyphMetrics | null;
  cursorRow?: number | null;
  optionRows?: readonly number[];
  waiting?: boolean;
  scrolled?: boolean;
  scrollKey?: number;
};

type PreviewPromptProps = {
  ends: Block['ends'];
  position: number;
  total: number;
  hasChoice: boolean;
};

type PreviewViewProps = {
  blocks: BlockDoc;
  terms: GlossaryTerm[];
  metrics: GlyphMetrics | null;
  sheet: GlyphSheet | null;
};

type PreviewControlsParams = {
  atEnd: boolean;
  optionCount: number;
  onAdvance: () => void;
  onRestart: () => void;
};

export type {
  ChoiceCursorProps, ChoiceKind, GlyphRowProps, PreviewBoxProps, PreviewChoice, PreviewControlsParams, PreviewPromptProps, PreviewRow, PreviewScreen,
  PreviewViewProps, ScreenParams,
};
