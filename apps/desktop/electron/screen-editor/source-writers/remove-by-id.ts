/* @layer electron-main @kind logic */
import { recordSpan } from './record-span';
import type { WriteResult } from './source-writers.type';

const removeById = (content: string, id: string, extraNeedle?: string): WriteResult => {
  const span = recordSpan(content, id, extraNeedle);
  if (!span) return { content, error: `Could not find id '${id}' in file` };
  const end = content[span.end] === '\n' ? span.end + 1 : span.end;
  return { content: content.slice(0, span.start) + content.slice(end) };
};

export { removeById };
