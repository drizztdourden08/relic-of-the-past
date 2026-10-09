/* @layer shared-game @kind logic */
import type { DialogueLineView } from '../lines/types';
import type { StructurePolicy } from './types';
import { nextAdvance } from './next-advance';
import { rowOfAdvance } from './row-of-advance';

const pushDown = (
  lines: DialogueLineView[],
  policy: StructurePolicy,
  seeds: ReadonlySet<number>,
): DialogueLineView[] => {
  let pushing = false;
  let previous: DialogueLineView | null = null;

  return lines.map((line, at) => {
    const opensBox = previous !== null && previous.endsBox;
    if (opensBox && !policy.cascadesAcrossBlocks) pushing = false;
    if (seeds.has(at)) pushing = true;

    if (!pushing) {
      previous = line;
      return line;
    }

    const advance = nextAdvance(previous, policy);
    const pushed: DialogueLineView = { ...line, advance, row: rowOfAdvance(advance) };
    previous = pushed;
    return pushed;
  });
};

export { pushDown };
