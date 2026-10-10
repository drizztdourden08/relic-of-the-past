/* @layer shared-game @kind logic */
import { flattenBlocks } from '../blocks/flatten-blocks';
import type { BlockDoc } from '../blocks/types';
import type { DialogueLineView } from '../lines/types';
import { locateCaret } from './locate';
import { policyFor } from './modes';
import { pushDown } from './push-down';
import { rebuild } from './rebuild';
import type { Caret, StructureContext, StructureMode } from './types';

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
  if (source === undefined) throw new Error(`The caret line ${String(at.line)} does not exist`);
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
