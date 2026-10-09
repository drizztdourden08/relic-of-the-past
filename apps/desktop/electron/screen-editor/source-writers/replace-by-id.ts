/* @layer electron-main @kind logic */
import { recordSpan } from './record-span';
import type { WriteResult } from './source-writers.type';

const replaceById = (content: string, id: string, code: string, extraNeedle?: string): WriteResult => {
  const span = recordSpan(content, id, extraNeedle);
  if (!span) return { content, error: `Could not find id '${id}' in file` };
  return { content: content.slice(0, span.start) + code + content.slice(span.end) };
};

export { replaceById };
