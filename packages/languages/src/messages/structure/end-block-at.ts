/* @layer shared-game @kind logic */
import { flattenBlocks } from '../blocks/flatten-blocks';
import type { BlockDoc } from '../blocks/types';
import { locateCaret } from './locate';
import { rebuild } from './rebuild';
import type { Caret, StructureContext } from './types';

const endBlockAt = (doc: BlockDoc, caret: Caret, ctx: StructureContext): BlockDoc => {
  const site = locateCaret(doc, caret);
  if (site === null) return doc;
  const caretOnLastLine = site.lineInBlock === site.linesInBlock - 1;
  if (caretOnLastLine) return doc;

  const ended = flattenBlocks(doc).map(
    (line, at) => (at === caret.line ? { ...line, endsBox: true } : line),
  );

  return rebuild(ended, ctx);
};

export { endBlockAt };
