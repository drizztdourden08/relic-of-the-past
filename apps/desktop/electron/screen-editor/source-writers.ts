/* @layer electron-main @kind logic */
/**
 * Write helpers for the editor's source-file edits. Each data file exports one
 * array literal: insert a new entry before the closing `];`, or replace/remove
 * the entry whose `id:` matches.
 *
 * Records are matched by walking real brace depth, not by regex: a v8 record is
 * multi-line and contains nested objects and arrays, which a `\{[^}]*\}` pattern
 * silently fails to span. An `id` is the only key ever matched on.
 */

interface Span {
  start: number;
  end: number;
}

interface WriteResult {
  content: string;
  error?: string;
}

const escapeSingleQuote = (s: string): string => s.replace(/'/g, "\\'");

/**
 * Every outermost `{...}` region in the file, skipping string literals and
 * comments so a brace inside either cannot shift the depth.
 */
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

/**
 * The full lines occupied by the record carrying `id`, trailing comma included.
 * `extraNeedle` is for item groups, whose `id` may still read the symbolic
 * `ITEM_GROUP_IDS.<Key>` form (see item-group-writer.ts). No other kind needs it.
 */
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

/** Insert `code` immediately before the last `];` in the file. */
const insertBeforeArrayClose = (content: string, code: string): WriteResult => {
  const lastBracket = content.lastIndexOf('];');
  if (lastBracket === -1) return { content, error: 'Could not find array closing bracket in file' };
  return { content: content.slice(0, lastBracket) + code + '\n' + content.slice(lastBracket) };
};

/** Replace the record whose `id` matches with `code`. */
const replaceById = (content: string, id: string, code: string, extraNeedle?: string): WriteResult => {
  const span = recordSpan(content, id, extraNeedle);
  if (!span) return { content, error: `Could not find id '${id}' in file` };
  return { content: content.slice(0, span.start) + code + content.slice(span.end) };
};

/** Remove the record whose `id` matches, and the line it sat on. */
const removeById = (content: string, id: string, extraNeedle?: string): WriteResult => {
  const span = recordSpan(content, id, extraNeedle);
  if (!span) return { content, error: `Could not find id '${id}' in file` };
  const end = content[span.end] === '\n' ? span.end + 1 : span.end;
  return { content: content.slice(0, span.start) + content.slice(end) };
};

export { escapeSingleQuote, insertBeforeArrayClose, removeById, replaceById };
export type { Span, WriteResult };
