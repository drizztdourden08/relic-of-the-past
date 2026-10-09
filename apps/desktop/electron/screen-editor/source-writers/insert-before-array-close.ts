/* @layer electron-main @kind logic */
import type { WriteResult } from './source-writers.type';

const insertBeforeArrayClose = (content: string, code: string): WriteResult => {
  const lastBracket = content.lastIndexOf('];');
  if (lastBracket === -1) return { content, error: 'Could not find array closing bracket in file' };
  return { content: content.slice(0, lastBracket) + code + '\n' + content.slice(lastBracket) };
};

export { insertBeforeArrayClose };
