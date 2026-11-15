/* @layer renderer-components @kind logic */
import type { GlyphNames } from '../../language-editor.type';

const renameInText = (value: string, names: GlyphNames): string =>
  Object.entries(names).reduce((text, [placeholder, letter]) => text.replaceAll(placeholder, letter), value);

const renameInRecord = <K extends PropertyKey>(record: Readonly<Record<K, string>>, names: GlyphNames): Record<K, string> => {
  const next: Record<K, string> = { ...record };
  (Object.keys(next) as K[]).forEach((key) => {
    next[key] = renameInText(next[key], names);
  });
  return next;
};

export { renameInRecord, renameInText };
