/* @layer renderer-components @kind logic */
import { advanceOfAttrs, DIALOGUE_LINE_TYPE, endsBoxOfAttrs } from './line-attrs';
import { inlineTokensOf } from './attrs-to-token';
import { viewOfShape } from './line-shape';
import type { JSONContent } from '@tiptap/core';
import type { DialogueLineView, GlossaryTerm, GlyphMetrics } from '@rotp/languages';

const blocksOf = (doc: JSONContent): JSONContent[] => {
  if (doc.type === DIALOGUE_LINE_TYPE) return [doc];
  return (doc.content ?? []).filter((block) => block.type === DIALOGUE_LINE_TYPE);
};

const docToLines = (
  doc: JSONContent,
  metrics: GlyphMetrics,
  glossary: GlossaryTerm[],
): DialogueLineView[] => {
  let box = 0;

  return blocksOf(doc).map((block, index) => {
    const endsBox = endsBoxOfAttrs(block.attrs);
    const shape = { advance: advanceOfAttrs(block.attrs), tokens: inlineTokensOf(block), endsBox };
    const view = viewOfShape({ shape, index, box, metrics, glossary });
    if (endsBox) box += 1;
    return view;
  });
};

export { docToLines };
