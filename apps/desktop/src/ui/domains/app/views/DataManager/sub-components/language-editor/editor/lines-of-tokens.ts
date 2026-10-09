/* @layer renderer-components @kind logic */
import { splitLines } from '@rotp/languages';
import type { DialogueLineView, GlossaryTerm, GlyphMetrics, Token } from '@rotp/languages';
import { measurableGlossary } from './line-shape';

const linesOfTokens = (
  tokens: Token[],
  metrics: GlyphMetrics,
  glossary: GlossaryTerm[],
): DialogueLineView[] => splitLines(tokens, metrics, measurableGlossary(tokens, glossary));

export { linesOfTokens };
