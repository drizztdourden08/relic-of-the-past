/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useState } from 'react';
import { glyphPlaceholder, kLanguages } from '@rotp/asset-extraction';
import type { LanguageSet } from '@rotp/languages';
import type { GlyphNames } from '../language-editor.type';
import type { GlyphNamingParams, GlyphNamingState } from './glyph-naming/glyph-naming.type';
import { nameProblems } from './glyph-naming/name-problems';
import { placeholderGlyphs } from './glyph-naming/placeholder-glyphs';

const takenLetters = (set: LanguageSet | null): Set<string> => {
  const named = Object.entries(set?.glyphs ?? {}).filter(([token, glyph]) => token !== glyphPlaceholder(glyph));
  const alphabet = set ? kLanguages[set.base]?.alphabet ?? [] : [];
  return new Set([...alphabet, ...named.map(([token]) => token)]);
};

const filledNames = (names: GlyphNames, problems: GlyphNames): GlyphNames =>
  Object.fromEntries(Object.entries(names).filter(([token, value]) => value.length > 0 && problems[token] === undefined));

const useGlyphNaming = (params: GlyphNamingParams): GlyphNamingState => {
  const { set, readOnly, onRename } = params;
  const [names, setNames] = useState<GlyphNames>({});
  const glyphs = useMemo(() => placeholderGlyphs(set), [set]);
  const taken = useMemo(() => takenLetters(set), [set]);
  const problems = useMemo(() => nameProblems({ names, taken }), [names, taken]);
  const ready = useMemo(() => filledNames(names, problems), [names, problems]);
  const canSave = !readOnly && Object.keys(problems).length === 0 && Object.keys(ready).length > 0;

  const setName = useCallback((token: string, value: string) => {
    setNames((current) => ({ ...current, [token]: value.trim() }));
  }, []);

  const save = useCallback(() => {
    if (!canSave) return;
    onRename(ready);
    setNames({});
  }, [canSave, onRename, ready]);

  return { glyphs, names, problems, canSave, setName, save };
};

export { useGlyphNaming };
