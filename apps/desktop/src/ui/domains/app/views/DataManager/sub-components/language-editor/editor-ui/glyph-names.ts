/* @layer renderer-components @kind logic */
import { isGlyphName } from '@shared/game/language';
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import { BRACKETED } from './glyph-names.constants';

const glyphNamesOf = (cfg: LanguageConfig): Set<string> => {
  const names = new Set<string>();
  for (const entry of cfg.alphabet) {
    const name = BRACKETED.exec(entry)?.[1];
    if (name !== undefined && isGlyphName(name, cfg)) names.add(name);
  }
  return names;
};

export { glyphNamesOf };
