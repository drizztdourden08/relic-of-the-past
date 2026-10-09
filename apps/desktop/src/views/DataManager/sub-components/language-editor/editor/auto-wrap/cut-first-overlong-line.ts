/* @layer renderer-components @kind logic */
import { lineMetrics, ROW_WIDTH_PX, breakLine } from '@rotp/languages';
import type { Token } from '@rotp/languages';
import type { Node as PmNode } from '@tiptap/pm/model';
import type { Transaction } from '@tiptap/pm/state';
import { editorRuntime } from '../editor-runtime';
import { tokensOfLine } from '../line-tokens';
import { advanceAfterLine, measurableGlossary } from '../line-shape';
import { advanceOfAttrs, attrsForLine, DIALOGUE_LINE_TYPE, endsBoxOfAttrs } from '../line-attrs';

const sizeOfToken = (token: Token): number => (token.t === 'text' ? token.v.length : 1);

const sizeOfTokens = (tokens: Token[]): number => tokens.reduce((sum, t) => sum + sizeOfToken(t), 0);

const cutFirstOverlongLine = (tr: Transaction): boolean => {
  const { metrics, glossary } = editorRuntime;
  if (metrics === null) return false;

  let done = false;
  tr.doc.forEach((node: PmNode, offset: number) => {
    if (done || node.type.name !== DIALOGUE_LINE_TYPE) return;

    const tokens = tokensOfLine(node);
    const safeGlossary = measurableGlossary(tokens, glossary);
    if (lineMetrics(tokens, metrics, safeGlossary).widthPx <= ROW_WIDTH_PX) return;

    const cut = breakLine(tokens, { metrics, glossary: safeGlossary });
    if (cut === null) return;

    const wasEnding = endsBoxOfAttrs(node.attrs);
    const advance = advanceAfterLine({
      advance: advanceOfAttrs(node.attrs),
      tokens: [],
      endsBox: false,
    });

    const spaceAt = offset + 1 + sizeOfTokens(cut.head);
    tr.delete(spaceAt, spaceAt + 1);
    tr.split(spaceAt, 1, [{
      type: tr.doc.type.schema.nodes[DIALOGUE_LINE_TYPE],
      attrs: attrsForLine(advance, wasEnding),
    }]);
    if (wasEnding) {
      tr.setNodeMarkup(offset, undefined, { ...node.attrs, endsBox: false });
    }
    done = true;
  });

  return done;
};

export { cutFirstOverlongLine };
