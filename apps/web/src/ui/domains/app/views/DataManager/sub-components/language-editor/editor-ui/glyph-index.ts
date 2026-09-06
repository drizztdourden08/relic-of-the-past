/* @layer renderer-components @kind logic */
/**
 * The character index behind a bracketed name.
 *
 * A picture character and a control code are both spelled as a bare bracket run,
 * so which of the two a name is depends on the language's own alphabet, and
 * the answer is its position in that alphabet, which is also its index into the
 * font sheet. The match must consume the WHOLE name: a shorter one means the
 * alphabet only recognised a prefix and this is a real command.
 *
 * `glyphIndexOf` is the same greedy matcher the row measurement and the entry
 * validator run on, so a character the editor draws is a character those two
 * already counted and charged a width for.
 */
import { glyphIndexOf } from '@shared/game/language';
import type { GlyphMetrics } from '@shared/game/language';

/**
 * The character `[name]` draws with. Null when this alphabet has no such
 * character, and also null when the pack's font has not been read yet, so there
 * is no alphabet to ask. The caller tells the two apart by whether it holds
 * metrics.
 */
const pictureGlyphIndex = (name: string, metrics: GlyphMetrics | null): number | null => {
  if (metrics === null) return null;
  const match = glyphIndexOf(`[${name}]`, 0, metrics);
  return match !== null && match.length === name.length + 2 ? match.index : null;
};

export { pictureGlyphIndex };
