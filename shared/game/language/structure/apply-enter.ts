/* @layer shared-game @kind logic */
/**
 * What pressing Enter does to an entry.
 *
 * The caret's line is cut in two: what was before the caret stays where it is,
 * what was after it becomes a new line directly below. Nothing about the wait
 * moves. It belongs after the last line of a box, so the SECOND half inherits
 * it and the box still ends where the author put it.
 *
 * Everything below the cut then moves down a row, and the codes that say so are
 * derived instead of typed (`pushDown`). How far that reaches is the mode's
 * decision, not this file's:
 *
 * - CONTINUOUS pushes to the end of the entry, past every wait, so a line
 *   inserted in the first box shifts the whole message down one row.
 * - BLOCK pushes only to the end of the caret's own box, and refuses outright
 *   once that box already holds its three rows. The author asked for their
 *   boxes to be left alone, and silently spilling into the next one is not
 *   leaving them alone.
 * - OFF does nothing at all.
 *
 * A refusal returns the document it was given, unchanged and by identity, so a
 * caller can tell "nothing happened" without comparing documents.
 */
import { flattenBlocks } from '../blocks/flatten-blocks';
import type { BlockDoc } from '../blocks/types';
import type { DialogueLineView } from '../lines/types';
import { locateCaret } from './locate';
import type { StructureMode } from './modes';
import { policyFor } from './modes';
import { pushDown } from './push-down';
import { rebuild } from './rebuild';
import type { Caret, StructureContext } from './types';

/**
 * True for a line with nothing to write: no code, no content, no wait. Such a
 * line leaves no trace in the token stream and would be lost on the way back, so
 * the push has to give it a code. That is also what an author expects, having
 * just asked for a blank row.
 */
const isTraceless = (line: DialogueLineView): boolean => (
  line.advance === null && line.tokens.length === 0 && !line.endsBox
);

const applyEnter = (
  doc: BlockDoc,
  at: Caret,
  mode: StructureMode,
  ctx: StructureContext,
): BlockDoc => {
  const policy = policyFor(mode);
  const site = locateCaret(doc, at);
  if (site === null || !policy.canOpenLine(site.linesInBlock)) return doc;

  const lines = flattenBlocks(doc);
  const source = lines[at.line];
  const head: DialogueLineView = {
    ...source,
    tokens: source.tokens.slice(0, at.token),
    endsBox: false,
  };
  const opened: DialogueLineView = { ...source, tokens: source.tokens.slice(at.token) };

  const cut = [...lines.slice(0, at.line), head, opened, ...lines.slice(at.line + 1)];
  const seeds = new Set(isTraceless(head) ? [at.line, at.line + 1] : [at.line + 1]);

  return rebuild(pushDown(cut, policy, seeds), ctx);
};

export { applyEnter };
