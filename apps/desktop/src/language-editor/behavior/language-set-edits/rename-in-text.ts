/* @layer renderer-components @kind logic */
import type { GlyphNames } from '../../language-editor.type';

const renameInText = (value: string, names: GlyphNames): string =>
  Object.entries(names).reduce((text, [placeholder, letter]) => text.replaceAll(placeholder, letter), value);

export { renameInText };
