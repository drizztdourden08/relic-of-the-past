/* @layer electron-main @kind logic */
import type { Span } from './source-writers.type';

const topLevelBraceSpans = (content: string): Span[] => {
  const spans: Span[] = [];
  let depth = 0;
  let start = -1;
  let quote: string | null = null;
  let comment: 'line' | 'block' | null = null;
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (comment === 'line') {
      if (ch === '\n') comment = null;
      continue;
    }
    if (comment === 'block') {
      if (ch === '*' && content[i + 1] === '/') { comment = null; i++; }
      continue;
    }
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '/' && content[i + 1] === '/') { comment = 'line'; i++; continue; }
    if (ch === '/' && content[i + 1] === '*') { comment = 'block'; i++; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        spans.push({ start, end: i + 1 });
        start = -1;
      }
    }
  }
  return spans;
};

export { topLevelBraceSpans };
