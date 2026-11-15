/* @layer renderer-components @kind logic */
import type { LanguageSet, TextOverrides } from '@rotp/languages';
import type { GlyphMap } from '@rotp/asset-extraction';
import type { GlyphNames } from '../../language-editor.type';
import { renameGlyphTokens } from './rename-glyph-tokens';
import { renameInRecord } from './rename-in-record';
import { renameInText } from './rename-in-text';

const renamedGlyphs = (glyphs: GlyphMap, names: GlyphNames): GlyphMap => {
  const next: GlyphMap = { ...glyphs };
  for (const [placeholder, letter] of Object.entries(names)) {
    const glyph = next[placeholder];
    if (glyph === undefined) continue;
    delete next[placeholder];
    next[letter] = glyph;
  }
  return next;
};

const renamedText = (text: TextOverrides | undefined, names: GlyphNames): TextOverrides | undefined => {
  if (!text) return text;
  return Object.fromEntries(Object.entries(text).map(([group, slots]) => [group, renameInRecord(slots ?? {}, names)]));
};

const withGlyphNames = (set: LanguageSet, names: GlyphNames): LanguageSet => {
  if (Object.keys(names).length === 0 || !set.glyphs) return set;
  return {
    ...set,
    glyphs: renamedGlyphs(set.glyphs, names),
    dialogue: set.dialogue.map((entry) => ({ ...entry, tokens: renameGlyphTokens(entry.tokens, names) })),
    glossary: set.glossary.map((term) => ({ ...term, value: renameInText(term.value, names) })),
    names: {
      items: renameInRecord(set.names.items, names),
      bottles: renameInRecord(set.names.bottles, names),
      labels: renameInRecord(set.names.labels, names),
    },
    text: renamedText(set.text, names),
  };
};

export { withGlyphNames };
