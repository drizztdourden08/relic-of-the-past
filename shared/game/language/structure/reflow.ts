/* @layer shared-game @kind logic */
/**
 * Put an edited entry back in shape: wrap what the author has overrun, and
 * re-derive the codes that say where each line sits.
 *
 * Two passes, and the order matters. A wrap adds lines, and the numbering has
 * to be the numbering of the final stack:
 *
 * 1. WRAP. Only a TOUCHED line is re-cut, at its last word boundary, and only
 *    while the mode allows another line to be opened. A wrap can cascade: the
 *    remainder is measured too, so a paste of three rows' worth of text lands as
 *    three lines. A word too wide to break is left whole and keeps reporting
 *    `overflow` (see `break-line.ts`).
 * 2. PUSH. Every line from a touched or newly created one onward gets a derived
 *    code, as far as the mode reaches (`pushDown`).
 *
 * A line the author has NOT touched, sitting before anything they have, comes
 * back exactly as it was read, irregular code and all. With an empty `touched`
 * set that is the whole entry, so opening an entry, measuring it and writing it
 * out again cannot rewrite a single byte of it. That is the property this whole
 * folder is built not to break: the line model never invents a code on its own,
 * and this is the only pass that may.
 */
import { flattenBlocks } from '../blocks/flatten-blocks';
import type { BlockDoc } from '../blocks/types';
import type { GlyphMetrics } from '../layout/types';
import { lineMetrics } from '../lines/line-metrics';
import type { DialogueLineView } from '../lines/types';
import type { GlossaryTerm } from '../types';
import type { LineBreak } from './break-line';
import { breakLine } from './break-line';
import type { StructureMode, StructurePolicy } from './modes';
import { policyFor } from './modes';
import { pushDown } from './push-down';
import { rebuild } from './rebuild';
import type { StructureContext } from './types';

/** A line mid-reflow, with the box it belongs to and whether it is derived. */
type WorkLine = {
  line: DialogueLineView;
  block: number;
  seeded: boolean;
};

/** Which block each line of the document belongs to, by flattened position. */
const ownersOf = (doc: BlockDoc): number[] => doc.blocks.flatMap(
  (block, at) => block.lines.map(() => at),
);

/** The cut this line needs, or null when it fits or cannot be shortened. */
const cutFor = (
  line: DialogueLineView,
  ctx: StructureContext,
  room: boolean,
): LineBreak | null => {
  if (!room) return null;
  if (!lineMetrics(line.tokens, ctx.metrics, ctx.glossary).overflow) return null;
  return breakLine(line.tokens, ctx);
};

/** Pass one: wrap the touched lines, growing the stack as it goes. */
const wrapTouched = (
  doc: BlockDoc,
  touched: ReadonlySet<number>,
  policy: StructurePolicy,
  ctx: StructureContext,
): WorkLine[] => {
  const owners = ownersOf(doc);
  const held = doc.blocks.map(block => block.lines.length);
  const out: WorkLine[] = [];

  flattenBlocks(doc).forEach((line, at) => {
    const block = owners[at];
    if (!touched.has(at)) {
      out.push({ line, block, seeded: false });
      return;
    }

    let rest = line;
    let cut = cutFor(rest, ctx, policy.canOpenLine(held[block]));

    while (cut !== null) {
      // The wait stays with the last line of the box, so the head gives it up.
      out.push({ line: { ...rest, tokens: cut.head, endsBox: false }, block, seeded: true });
      held[block] += 1;
      rest = { ...rest, tokens: cut.tail };
      cut = cutFor(rest, ctx, policy.canOpenLine(held[block]));
    }

    out.push({ line: rest, block, seeded: true });
  });

  return out;
};

const reflow = (
  doc: BlockDoc,
  metrics: GlyphMetrics,
  glossary: GlossaryTerm[],
  touched: ReadonlySet<number>,
  mode: StructureMode,
): BlockDoc => {
  const policy = policyFor(mode);
  const ctx: StructureContext = { metrics, glossary };

  const work = wrapTouched(doc, touched, policy, ctx);
  const seeds = new Set(work.flatMap(({ seeded }, at) => (seeded ? [at] : [])));

  return rebuild(pushDown(work.map(({ line }) => line), policy, seeds), ctx);
};

export { reflow };
