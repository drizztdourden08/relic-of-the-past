/* @layer shared-game @kind logic */
import { flattenBlocks } from '../blocks/flatten-blocks';
import type { BlockDoc } from '../blocks/types';
import { lineMetrics } from '../lines/line-metrics';
import type { DialogueLineView } from '../lines/types';
import { breakLine } from './break-line';
import { policyFor } from './modes';
import { pushDown } from './push-down';
import { rebuild } from './rebuild';
import type { LineBreak, StructureContext, StructureMode, StructurePolicy, WorkLine } from './types';

const ownersOf = (doc: BlockDoc): number[] => doc.blocks.flatMap(
  (block, at) => block.lines.map(() => at),
);

const cutFor = (
  line: DialogueLineView,
  ctx: StructureContext,
  room: boolean,
): LineBreak | null => {
  if (!room) return null;
  if (!lineMetrics(line.tokens, ctx.metrics, ctx.glossary).overflow) return null;
  return breakLine(line.tokens, ctx);
};

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
    if (block === undefined) throw new Error(`Line ${String(at)} has no owning block`);
    if (!touched.has(at)) {
      out.push({ line, block, seeded: false });
      return;
    }

    const heldIn = (): number => {
      const count = held[block];
      if (count === undefined) throw new Error(`Block ${String(block)} has no line count`);
      return count;
    };
    let rest = line;
    let cut = cutFor(rest, ctx, policy.canOpenLine(heldIn()));

    while (cut !== null) {
      out.push({ line: { ...rest, tokens: cut.head, endsBox: false }, block, seeded: true });
      held[block] = heldIn() + 1;
      rest = { ...rest, tokens: cut.tail };
      cut = cutFor(rest, ctx, policy.canOpenLine(heldIn()));
    }

    out.push({ line: rest, block, seeded: true });
  });

  return out;
};

const reflow = (
  doc: BlockDoc,
  ctx: StructureContext,
  touched: ReadonlySet<number>,
  mode: StructureMode,
): BlockDoc => {
  const policy = policyFor(mode);

  const work = wrapTouched(doc, touched, policy, ctx);
  const seeds = new Set(work.flatMap(({ seeded }, at) => (seeded ? [at] : [])));

  return rebuild(pushDown(work.map(({ line }) => line), policy, seeds), ctx);
};

export { reflow };
