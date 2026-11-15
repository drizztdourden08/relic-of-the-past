/* @layer renderer-components @kind logic */
import type { GlyphNames } from '../../language-editor.type';
import { renameInText } from './rename-in-text';

const renameInRecord = <K extends PropertyKey>(record: Readonly<Record<K, string>>, names: GlyphNames): Record<K, string> => {
  const next: Record<K, string> = { ...record };
  (Object.keys(next) as K[]).forEach((key) => {
    next[key] = renameInText(next[key], names);
  });
  return next;
};

export { renameInRecord };
