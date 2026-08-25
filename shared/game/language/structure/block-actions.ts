/* @layer shared-game @kind logic */
/**
 * The two things an author can ask for from inside a box: stop here, or keep
 * going.
 *
 * END HERE puts the wait after the caret's line. It lands at the END of that
 * line rather than at the caret, because a box ends where a row ends — a wait
 * dropped mid-row would hold the screen with half a sentence on it. Nothing is
 * added or removed: the same lines come back, cut into two boxes, so the text
 * itself is untouched and only the button press is new.
 *
 * KEEP GOING extends the box with one more line, reached by a scroll. That is
 * not one option among several — a scroll is the ONLY way the engine makes room.
 * The pixel buffer is cleared once per message and the blitter draws by
 * inverting the tiles under it, so a row written a second time inverts what is
 * already there and leaves the tail of the older, longer row standing. There is
 * no "start a fresh box" to offer, and offering one would produce corruption.
 *
 * The new line takes over the box's wait, so the box still ends the way it
 * ended: a box that waited still waits, and one that ran to the end of the
 * message still does.
 */
import { flattenBlocks } from '../blocks/flatten-blocks';
import type { BlockDoc } from '../blocks/types';
import type { DialogueLineView } from '../lines/types';
import { locateCaret } from './locate';
import { rebuild } from './rebuild';
import type { Caret, StructureContext } from './types';

/** End the caret's box after the caret's line, splitting it in two. */
const endBlockAt = (doc: BlockDoc, caret: Caret, ctx: StructureContext): BlockDoc => {
  const site = locateCaret(doc, caret);
  if (site === null) return doc;
  // Already the last line: the wait this would insert is the one already there.
  if (site.lineInBlock === site.linesInBlock - 1) return doc;

  const ended = flattenBlocks(doc).map(
    (line, at) => (at === caret.line ? { ...line, endsBox: true } : line),
  );

  return rebuild(ended, ctx);
};

/** Extend the caret's box with one more line, scrolled into view. */
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

export { continueByScrolling, endBlockAt };
