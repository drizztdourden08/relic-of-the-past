/* @layer renderer-components @kind logic */
/**
 * Editor document to lines. This is the return half of the bridge, and the pivot
 * every consumer reads.
 *
 * There is exactly one view per paragraph, always, which is what keeps the
 * gutter beside the text honest: row three of the gutter belongs to the third
 * paragraph whatever that paragraph contains, including nothing at all.
 *
 * The token stream falls out of these views through the model's own inverse
 * (`joinLines`), so this file never writes a control code. An entry that was
 * opened and not edited therefore comes back out byte-identical: its advance
 * codes were carried through the attributes untouched, and nothing here invents
 * or corrects one.
 */
import { advanceOfAttrs, DIALOGUE_LINE_TYPE, endsBoxOfAttrs } from './line-attrs';
import { inlineTokensOf } from './attrs-to-token';
import { viewOfShape } from './line-shape';
import type { JSONContent } from '@tiptap/core';
import type { DialogueLineView, GlossaryTerm, GlyphMetrics } from '@shared/game/language';

/** The blocks to walk. A bare paragraph is accepted as a one-line document. */
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
    const view = viewOfShape(shape, index, box, metrics, glossary);
    if (endsBox) box += 1;
    return view;
  });
};

export { docToLines };
