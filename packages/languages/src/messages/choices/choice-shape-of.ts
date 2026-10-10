/* @layer shared-game @kind logic */
import type { Token } from '../types';
import { advanceOfToken, isWaitToken } from '../lines/advance-codes';
import type { ChoiceCode, ChoiceOption, ChoiceShape, LineSpan } from './types';
import { CHOICE_CODES } from './choices.constants';

const isChoiceCode = (name: string): name is ChoiceCode => CHOICE_CODES.includes(name);

const optionCountOf = (code: ChoiceCode): number => (code === 'Choose3' ? 3 : 2);

const lineSpansOf = (tokens: Token[]): LineSpan[] => {
  const spans: LineSpan[] = [];
  let open: LineSpan | null = null;

  for (const [index, token] of tokens.entries()) {
    const advance = advanceOfToken(token);
    if (advance !== undefined) {
      if (open !== null) spans.push(open);
      open = { start: index, advance, contentStart: index + 1, end: index + 1, endsBox: false };
      continue;
    }
    open ??= { start: index, advance: null, contentStart: index, end: index, endsBox: false };
    if (isWaitToken(token)) {
      open.endsBox = true;
      spans.push(open);
      open = null;
      continue;
    }
    open.end = index + 1;
  }

  if (open !== null) spans.push(open);
  return spans;
};

const optionOf = (tokens: Token[], span: LineSpan): ChoiceOption => ({
  advance: span.advance,
  tokens: tokens.slice(span.contentStart, span.end),
});

const choiceShapeOf = (tokens: Token[]): ChoiceShape | null => {
  const last = tokens.at(-1);
  if (last?.t !== 'cmd' || last.param !== undefined) return null;
  if (!isChoiceCode(last.name)) return null;

  const body = tokens.slice(0, -1);
  const spans = lineSpansOf(body);
  const count = optionCountOf(last.name);
  if (spans.length < count) return null;

  const optionSpans = spans.slice(-count);
  if (optionSpans.some((span) => span.endsBox)) return null;
  const [firstSpan] = optionSpans;
  if (firstSpan === undefined) throw new Error('A choice has no option spans');

  return {
    code: last.name,
    question: body.slice(0, firstSpan.start),
    options: optionSpans.map((span) => optionOf(body, span)),
  };
};

export { choiceShapeOf };
