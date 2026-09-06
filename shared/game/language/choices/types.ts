/* @layer shared-game @kind types */
/**
 * The decomposed view of a choice prompt. An entry whose final control code
 * turns its last lines into a selection menu.
 *
 * `question` is a VERBATIM slice of the original stream (advance codes and
 * waits included), and each option keeps the advance code that put its line on
 * a row exactly as authored, so the inverse can rebuild the entry byte for
 * byte. Nothing here is normalised or invented.
 */
import type { Token } from '../types';
import type { LineAdvance } from '../lines/types';

/** The four prompt codes; `Choose3` takes three options, the rest take two. */
type ChoiceCode = 'Choose' | 'Choose2' | 'Choose3' | 'Selchg';

/** One selectable line: what put the pen on its row, and the line's content. */
type ChoiceOption = {
  /** The line's opening code, preserved exactly as authored. */
  advance: LineAdvance;
  /** Content tokens only. No advance code, no prompt code. */
  tokens: Token[];
};

/** A whole choice prompt, decomposed losslessly. */
type ChoiceShape = {
  code: ChoiceCode;
  /** Everything before the first option line, as a verbatim token slice. */
  question: Token[];
  /** The trailing lines the cursor moves between, in stream order. */
  options: ChoiceOption[];
};

export type { ChoiceCode, ChoiceOption, ChoiceShape };
