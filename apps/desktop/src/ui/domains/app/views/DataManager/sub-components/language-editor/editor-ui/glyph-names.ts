/* @layer renderer-components @kind logic */
import { isGlyphName } from '@rotp/languages';
import type { LanguageConfig } from '@rotp/asset-extraction';
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
