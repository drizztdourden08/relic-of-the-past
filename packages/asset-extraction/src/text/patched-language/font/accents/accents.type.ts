/* @layer shared-asset-extraction @kind types */
import type { GlyphNaming } from '../font.type';

type PixelGrid = readonly (readonly number[])[];

interface Shape {
  top: number;
  height: number;
  width: number;
  cells: number[][];
}

interface ShapeOffset {
  row: number;
  col: number;
}

type MarkZone = 'above' | 'below';

interface MarkCut {
  shape: Shape;
  zone: MarkZone;
  clear: boolean;
  removed: number;
  inside: number;
  matched: number;
}

interface CutInput {
  glyph: PixelGrid;
  base: PixelGrid;
  shift: number;
  column?: number;
}

interface LearnedMark {
  mark: string;
  shape: Shape;
  zone: MarkZone;
  release: string;
}

interface MarkSplit {
  letter: string;
  mark: string;
}

interface MarkGuess {
  mark: string;
  score: number;
  source: string | null;
}

interface MarkPick {
  cut: MarkCut;
  marks: readonly LearnedMark[];
  letter: string;
}

interface LetterCandidate extends MarkGuess {
  letter: string;
  cost: number;
  matched: number;
}

interface CandidateInput {
  target: PixelGrid;
  base: PixelGrid;
  letter: string;
  marks: readonly LearnedMark[];
}

interface FlipInput {
  tiles: Uint8Array;
  alphabet: readonly string[];
  glyph: number;
}

interface ComposeInput extends FlipInput {
  marks: readonly LearnedMark[];
}

type ComposedLetter = Omit<GlyphNaming, 'glyph'>;

export type {
  CandidateInput, ComposeInput, ComposedLetter, CutInput, FlipInput, LearnedMark, LetterCandidate, MarkCut, MarkGuess,
  MarkPick, MarkSplit, PixelGrid, Shape, ShapeOffset,
};
