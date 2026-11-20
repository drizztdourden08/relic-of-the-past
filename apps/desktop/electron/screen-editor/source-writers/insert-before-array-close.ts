/* @layer electron-main @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { mainText } from '../../lib/main-text';
import type { WriteResult } from './source-writers.type';

const insertBeforeArrayClose = (content: string, code: string): WriteResult => {
  const lastBracket = content.lastIndexOf('];');
  if (lastBracket === -1) return { content, error: mainText(msg('screen-editor:source.noArrayClose')) };
  return { content: `${content.slice(0, lastBracket)}${code}\n${content.slice(lastBracket)}` };
};

export { insertBeforeArrayClose };
