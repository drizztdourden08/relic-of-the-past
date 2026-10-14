/* @layer electron-main @kind logic */
import { nonCodeEnd } from './non-code-end';
import type { Span } from './source-writers.type';

const topLevelBraceSpans = (content: string): Span[] => {
  const spans: Span[] = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < content.length; i++) {
    const skipTo = nonCodeEnd(content, i);
    if (skipTo >= 0) {
      i = skipTo;
      continue;
    }
    const ch = content[i];
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
