/* @layer renderer-components @kind logic */
/**
 * The legend rows for one line: every symbol the line ACTUALLY uses, once each,
 * in the order it first appears. Plain typed text contributes nothing — the
 * legend exists to explain the things that are not letters.
 *
 * Labels and descriptions come out of the control-code catalog, never from a
 * second table here, so a legend row says exactly what the toolbar's tooltip
 * said when the symbol was inserted.
 */
import { codeInfoFor } from '@shared/game/language';
import { GLOSSARY_ICON, iconForToken } from './icon-for-token';
import type { Token } from '@shared/game/language';
import type { LegendEntry } from './editor-ui.type';

/** Catalog name for a token that has one; null for a glossary reference. */
const codeNameOf = (token: Token): string | null => {
  if (token.t === 'cmd') return token.name;
  if (token.t === 'break') return String(token.row);
  if (token.t === 'var') return token.name === 'player-name' ? 'Name' : 'Number';
  return null;
};

const glyphEntry = (name: string): LegendEntry => ({
  id: `glyph-${name}`,
  icon: null,
  glyph: `[${name}]`,
  label: name,
  description: 'a picture character from this set\'s alphabet',
});

const refEntry = (key: string): LegendEntry => ({
  id: `ref-${key}`,
  icon: GLOSSARY_ICON,
  label: key,
  description: 'a reusable phrase from this set\'s glossary, expanded when the set is baked',
});

const codeEntry = (token: Token, name: string): LegendEntry => {
  const info = codeInfoFor(name);
  return {
    id: `code-${name}`,
    icon: iconForToken(token),
    label: info?.label ?? name,
    description: info?.description ?? 'no catalogued description',
  };
};

const entryFor = (token: Token, glyphNames: ReadonlySet<string>): LegendEntry | null => {
  if (token.t === 'text') return null;
  if (token.t === 'ref') return refEntry(token.key);
  const name = codeNameOf(token);
  if (name === null) return null;
  if (token.t === 'cmd' && glyphNames.has(name)) return glyphEntry(name);
  return codeEntry(token, name);
};

const legendEntriesFor = (tokens: Token[], glyphNames: ReadonlySet<string>): LegendEntry[] => {
  const seen = new Set<string>();
  const out: LegendEntry[] = [];
  for (const token of tokens) {
    const entry = entryFor(token, glyphNames);
    if (!entry || seen.has(entry.id)) continue;
    seen.add(entry.id);
    out.push(entry);
  }
  return out;
};

export { legendEntriesFor };
