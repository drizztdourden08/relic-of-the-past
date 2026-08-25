/* @layer renderer-components @kind logic */
/**
 * Which bracket names this language spells a PICTURE CHARACTER with, as a
 * membership set the inline chip can ask.
 *
 * A picture character and a control code are spelled identically -- a bare
 * bracket run -- and both round-trip as paramless `cmd` tokens, so telling them
 * apart needs the language's own alphabet. The set is derived from the alphabet
 * directly: every bracketed entry the code catalog does not claim as a control
 * code is a character, both halves of a paired picture included.
 */
import { isGlyphName } from '@shared/game/language';
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';

const BRACKETED = /^\[(.+)\]$/;

const glyphNamesOf = (cfg: LanguageConfig): Set<string> => {
  const names = new Set<string>();
  for (const entry of cfg.alphabet) {
    const name = BRACKETED.exec(entry)?.[1];
    if (name !== undefined && isGlyphName(name, cfg)) names.add(name);
  }
  return names;
};

export { glyphNamesOf };
