/* @layer shared-game @kind types */
import type { Token } from '../../types';
import type { LineAdvance } from '../../lines/types';

type ChoiceCode = 'Choose' | 'Choose2' | 'Choose3' | 'Selchg';

type ChoiceOption = {
  advance: LineAdvance;
  tokens: Token[];
};

type ChoiceShape = {
  code: ChoiceCode;
  question: Token[];
  options: ChoiceOption[];
};

type LineSpan = {
  start: number;
  advance: LineAdvance;
  contentStart: number;
  end: number;
  endsBox: boolean;
};

export type { ChoiceCode, ChoiceOption, ChoiceShape, LineSpan };
