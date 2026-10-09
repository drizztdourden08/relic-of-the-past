/* @layer renderer-components @kind logic */
import { splitLines } from '@shared/game/language';
import type { DialogueLineView, GlossaryTerm, GlyphMetrics, Token } from '@shared/game/language';
import { measurableGlossary } from './line-shape';

const linesOfTokens = (
  tokens: Token[],
  metrics: GlyphMetrics,
  glossary: GlossaryTerm[],
): DialogueLineView[] => splitLines(tokens, metrics, measurableGlossary(tokens, glossary));

export { linesOfTokens };
