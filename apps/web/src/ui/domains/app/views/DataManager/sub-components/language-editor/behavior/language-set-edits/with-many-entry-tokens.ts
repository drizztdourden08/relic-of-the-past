/* @layer renderer-components @kind logic */
import type { LanguageSet, Token } from '@shared/game/language';

const withManyEntryTokens = (
  set: LanguageSet,
  edits: { entryId: number; tokens: Token[] }[],
): LanguageSet => {
  if (edits.length === 0) return set;
  const byId = new Map(edits.map((edit) => [edit.entryId, edit.tokens]));
  const dialogue = set.dialogue.map((entry) => {
    const tokens = byId.get(entry.id);
    return tokens === undefined ? entry : { ...entry, tokens };
  });
  return { ...set, dialogue };
};

export { withManyEntryTokens };
