/* @layer electron-main @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { mainText } from '../../lib/main-text';
import { recordSpan } from './record-span';
import type { WriteResult } from './source-writers.type';

const replaceById = (content: string, id: string, code: string, extraNeedle?: string): WriteResult => {
  const span = recordSpan(content, id, extraNeedle);
  if (!span) return { content, error: mainText(msg('screen-editor:source.idNotFound', { id })) };
  return { content: content.slice(0, span.start) + code + content.slice(span.end) };
};

export { replaceById };
