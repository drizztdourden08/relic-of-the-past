/* @layer renderer-components @kind logic */
/**
 * A stored token stream as the lines an author edits. It is the model's own
 * splitter, with the one guard the editor needs around it.
 *
 * Splitting measures each line as it goes, and measuring resolves glossary
 * references, which throws on a key the set no longer carries. Opening an entry
 * that points at a removed term must show the entry, not an error, so the
 * glossary is widened to answer every reference first (see `measurableGlossary`).
 * Nothing else is changed: the advance codes come back exactly as they were
 * authored, which is what `joinLines` needs to write them back untouched.
 */
import { splitLines } from '@shared/game/language';
import type { DialogueLineView, GlossaryTerm, GlyphMetrics, Token } from '@shared/game/language';
import { measurableGlossary } from './line-shape';

const linesOfTokens = (
  tokens: Token[],
  metrics: GlyphMetrics,
  glossary: GlossaryTerm[],
): DialogueLineView[] => splitLines(tokens, metrics, measurableGlossary(tokens, glossary));

export { linesOfTokens };
