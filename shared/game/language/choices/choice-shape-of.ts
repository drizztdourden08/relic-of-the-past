/* @layer shared-game @kind logic */
/**
 * Detect a choice prompt and take it apart into question and options.
 *
 * The shape below was worked out from a stored language set (397 entries, 43
 * of them prompts — ids 2, 3, 7-13, 25, 38, 45, 51, 134, 137, 138, 140, 142,
 * 150, 201, 202, 210, 217, 218, 219, 230, 244, 255, 266, 284, 287, 315, 323,
 * 324, 331, 335, 353, 383, 386, 389-392). In every one of them:
 *
 * - The prompt code is the LAST token of the entry, always without a param.
 * - The options are the last N lines before it — three for `Choose3`, two for
 *   the other codes — one option per line, and no wait-for-button falls inside
 *   them: a wait always sits at the end of the question part.
 * - Option lines open with a row marker (rows 2+3 after an in-box question,
 *   e.g. 142/218/219/315; rows 1+2 for `Choose2`, 389/391; rows 1-3 for
 *   `Choose3`, 390) or with a scroll when the question already scrolled
 *   (25/134/137 and most others). The cursor-redraw entries 2/3 and 12/13 even
 *   order their row markers bottom-first, so an option's advance is data, not
 *   a derivable position.
 * - The selection-cursor column is baked into the option TEXT: the default
 *   option starts with a cursor glyph and the others with spaces covering the
 *   same cells (`Selchg` indents both by one extra cell). Entry 335's options
 *   carry number substitutions, and 389/390 open with message-config codes on
 *   the first option's line, so option content is not guaranteed to be plain
 *   text.
 *
 * Detection mirrors those facts exactly and answers null for anything that
 *   deviates, so the caller falls back to the raw stream editor rather than
 *   guessing.
 */
import type { Token } from '../types';
import { advanceOfToken, isWaitToken } from '../lines/advance-codes';
import type { LineAdvance } from '../lines/types';
import type { ChoiceCode, ChoiceOption, ChoiceShape } from './types';

const CHOICE_CODES: readonly string[] = ['Choose', 'Choose2', 'Choose3', 'Selchg'];

const isChoiceCode = (name: string): name is ChoiceCode => CHOICE_CODES.includes(name);

/** How many option lines a prompt code consumes. */
const optionCountOf = (code: ChoiceCode): number => (code === 'Choose3' ? 3 : 2);

/** One line located by token index, mirroring the split in `lines/split-lines`. */
type LineSpan = {
  /** Index of the line's first token — its advance code when it has one. */
  start: number;
  advance: LineAdvance;
  /** Index of the first content token. */
  contentStart: number;
  /** Index one past the last content token. */
  end: number;
  /** The line was closed by a wait-for-button. */
  endsBox: boolean;
};

const lineSpansOf = (tokens: Token[]): LineSpan[] => {
  const spans: LineSpan[] = [];
  let open: LineSpan | null = null;

  tokens.forEach((token, index) => {
    const advance = advanceOfToken(token);
    if (advance !== undefined) {
      if (open !== null) spans.push(open);
      open = { start: index, advance, contentStart: index + 1, end: index + 1, endsBox: false };
      return;
    }
    if (open === null) {
      open = { start: index, advance: null, contentStart: index, end: index, endsBox: false };
    }
    if (isWaitToken(token)) {
      open.endsBox = true;
      spans.push(open);
      open = null;
      return;
    }
    open.end = index + 1;
  });

  if (open !== null) spans.push(open);
  return spans;
};

const optionOf = (tokens: Token[], span: LineSpan): ChoiceOption => ({
  advance: span.advance,
  tokens: tokens.slice(span.contentStart, span.end),
});

const choiceShapeOf = (tokens: Token[]): ChoiceShape | null => {
  const last = tokens[tokens.length - 1];
  if (last === undefined || last.t !== 'cmd' || last.param !== undefined) return null;
  if (!isChoiceCode(last.name)) return null;

  const body = tokens.slice(0, -1);
  const spans = lineSpansOf(body);
  const count = optionCountOf(last.name);
  if (spans.length < count) return null;

  const optionSpans = spans.slice(-count);
  if (optionSpans.some((span) => span.endsBox)) return null;

  return {
    code: last.name,
    question: body.slice(0, optionSpans[0].start),
    options: optionSpans.map((span) => optionOf(body, span)),
  };
};

export { choiceShapeOf };
