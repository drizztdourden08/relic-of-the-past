/* @layer electron-main @kind logic */
import { escapeSingleQuote } from './escape-single-quote';
import type { Span } from './source-writers.type';
import { topLevelBraceSpans } from './top-level-brace-spans';

const recordSpan = (content: string, id: string, extraNeedle?: string): Span | null => {
  const needle = `id: '${escapeSingleQuote(id)}'`;
  const spans = topLevelBraceSpans(content);
  const span = spans.find(s => content.slice(s.start, s.end).includes(needle))
    ?? (extraNeedle ? spans.find(s => content.slice(s.start, s.end).includes(extraNeedle)) : undefined);
  if (!span) return null;
  const start = content.lastIndexOf('\n', span.start) + 1;
  const end = content[span.end] === ',' ? span.end + 1 : span.end;
  return { start, end };
};

export { recordSpan };
