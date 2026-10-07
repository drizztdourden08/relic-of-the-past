/* @layer renderer-components @kind logic */
/**
 * Wrapping while you type. This is the editor's half of "the author never thinks
 * about the row".
 *
 * The engine never wraps: a row drawn past its 168px interior is drawn into the
 * next row's tiles. So the wrap happens here, live. After every change, the
 * first line wider than the row is cut at the last word boundary that still
 * fits (the model's own `breakLine`), the joining space is dropped the way any
 * wrap drops it, and the remainder becomes the next line with a derived
 * advance. The pass repeats until nothing is overlong, so a long paste settles
 * in one transaction.
 *
 * A single word or variable wider than a whole row has no safe cut, since
 * cutting it would change what it says, so it is left whole for the validator to
 * flag. `breakLine` answering null there is also what keeps this loop finite.
 *
 * The wait travels with the text: wrapping a line that ended its box moves the
 * wait onto the remainder, because the words that moved down still finish the
 * box.
 */
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { lineMetrics, ROW_WIDTH_PX } from '@shared/game/language';
import { breakLine } from '@shared/game/language/structure';
import type { Token } from '@shared/game/language';
import type { Node as PmNode } from '@tiptap/pm/model';
import type { Transaction } from '@tiptap/pm/state';
import { editorRuntime } from './editor-runtime';
import { tokensOfLine } from './line-tokens';
import { advanceAfterLine, measurableGlossary } from './line-shape';
import { advanceOfAttrs, attrsForLine, DIALOGUE_LINE_TYPE, endsBoxOfAttrs } from './line-attrs';

const autoWrapKey = new PluginKey('dialogueAutoWrap');

/** A wrap pass never needs more cuts than a paste has words; this is a fuse. */
const kMaxCutsPerPass = 32;

/** How many document positions a token's content occupies inside its line. */
const sizeOfToken = (token: Token): number => (token.t === 'text' ? token.v.length : 1);

const sizeOfTokens = (tokens: Token[]): number => tokens.reduce((sum, t) => sum + sizeOfToken(t), 0);

/**
 * Cuts the first overlong line found in `tr.doc`, returning whether it did.
 * Positions are taken fresh from the transaction's own document, so repeated
 * calls compose.
 */
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

    // The cut lands on the joining space: everything in `head` sits before it.
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

const autoWrapPlugin = () => new Plugin({
  key: autoWrapKey,
  appendTransaction: (transactions, _oldState, newState) => {
    if (!transactions.some((t) => t.docChanged)) return null;
    if (transactions.some((t) => t.getMeta(autoWrapKey) === true)) return null;

    const tr = newState.tr;
    let cuts = 0;
    while (cuts < kMaxCutsPerPass && cutFirstOverlongLine(tr)) cuts += 1;

    if (cuts === 0) return null;
    tr.setMeta(autoWrapKey, true);
    return tr;
  },
});

const AutoWrap = Extension.create({
  name: 'dialogueAutoWrap',
  addProseMirrorPlugins: () => [autoWrapPlugin()],
});

export { AutoWrap, autoWrapKey };
