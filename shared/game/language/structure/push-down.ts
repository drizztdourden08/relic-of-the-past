/* @layer shared-game @kind logic */
/**
 * The push: give every line from an edit onward the code the engine would need
 * to put it where it now sits, and leave every other line exactly as authored.
 *
 * One SEED marks a line the author changed or a line that has just been created.
 * From a seed the walk keeps deriving codes forward. That is what "push the
 * lines down" means in this model, since inserting a line really does move the
 * rows below it. The policy decides how far: continuous carries on past a
 * wait, the other two stop at the end of the box.
 *
 * A line before any seed, and every line when there are no seeds at all, keeps
 * the advance it was read with, irregular or not. That is the anti-corruption
 * property: an entry nobody edited is handed back with its codes untouched, so
 * `joinLines` re-emits the original token stream byte for byte. `splitLines`
 * never invents a code and `joinLines` never corrects one, so this walk is the
 * only thing standing between an opened editor and a rewritten translation.
 *
 * The cursor carries the row a line ENDED UP on, whether that came from a
 * derived code or an authored one, so numbering resumes from the authored
 * position instead of from an idealised one.
 */
import type { DialogueLineView } from '../lines/types';
import type { StructurePolicy } from './modes';
import { nextAdvance, rowOfAdvance } from './next-advance';

/**
 * Renumber from each seed onward. Line count and content are untouched; only
 * `advance` (and the `row` it implies) can change.
 */
const pushDown = (
  lines: DialogueLineView[],
  policy: StructurePolicy,
  seeds: ReadonlySet<number>,
): DialogueLineView[] => {
  let pushing = false;
  let previous: DialogueLineView | null = null;

  return lines.map((line, at) => {
    // A wait on the previous line means this one opens a box.
    if (previous !== null && previous.endsBox && !policy.cascadesAcrossBlocks) pushing = false;
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
