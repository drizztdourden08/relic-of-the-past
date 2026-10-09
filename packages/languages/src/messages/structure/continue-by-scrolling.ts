/* @layer shared-game @kind logic */
import { flattenBlocks } from '../blocks/flatten-blocks';
import type { BlockDoc } from '../blocks/types';
import type { DialogueLineView } from '../lines/types';
import { locateCaret } from './locate';
import { rebuild } from './rebuild';
import type { Caret, StructureContext } from './types';

const continueByScrolling = (doc: BlockDoc, caret: Caret, ctx: StructureContext): BlockDoc => {
  const site = locateCaret(doc, caret);
  if (site === null) return doc;

  const lines = flattenBlocks(doc);
  const lastAt = site.blockStart + site.linesInBlock - 1;
  const last = lines[lastAt];
  const scrolled: DialogueLineView = {
    ...last,
    advance: { kind: 'scroll' },
    tokens: [],
    endsBox: last.endsBox,
  };
  const kept = lines.map(
    (line, at) => (at === lastAt ? { ...line, endsBox: false } : line),
  );

  return rebuild([...kept.slice(0, lastAt + 1), scrolled, ...kept.slice(lastAt + 1)], ctx);
};

export { continueByScrolling };
