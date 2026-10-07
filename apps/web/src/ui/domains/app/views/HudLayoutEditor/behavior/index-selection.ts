/* @layer renderer-components @kind logic */
/**
 * PICKING ITEMS OUT OF A STRIP. This is the one gesture rule the grid's track
 * headers and the flex editor's child cells share (§58).
 *
 * Both are a LINE of numbered things, and both answer a press the same way:
 * plain picks one, `Shift` takes the run from the anchor, the primary modifier
 * toggles one in or out, and emptying the set is no selection at all. That was
 * `use-grid-selection`'s `selectTrack` and it is the whole of a flex item pick,
 * so it moved here instead of being written twice with the second copy free to
 * grow a different `Shift`.
 *
 * `isPrimaryModifier` IS THE ONLY MODIFIER TEST (§43.6). There is never a literal
 * `ctrlKey` check, so `Cmd` works on a Mac and the legend's own cap, which comes from
 * the same `primaryModifierLabel`, cannot promise a key that does nothing.
 *
 * IT WRITES NOTHING AND CANNOT. It takes numbers and answers numbers: what is
 * selected is context for a toolbar and an echo, never an edit.
 */
import { isPrimaryModifier } from '@shared/platform';
import type { OsKind } from '@shared/platform';

/** What a strip's selection is, once the axis and the kind are stripped off. */
interface IndexRun {
  indices: readonly number[];
  anchor: number;
}

/** Only the three flags matter; taking them as a shape instead of as a React
 *  event is what lets a test press a key without a DOM. */
interface PressModifiers {
  readonly shiftKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
}

const runBetween = (from: number, to: number): number[] => {
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  return Array.from({ length: hi - lo + 1 }, (_unused, i) => lo + i);
};

/**
 * The next selection after pressing `index`. `held` is the current run when the
 * press lands on the SAME strip and `null` otherwise. A `Shift` across two
 * different strips has no anchor to measure from, which is why the caller
 * decides instead of this file guessing.
 *
 * `null` back means "nothing is selected now": the modifier removed the last
 * member, and a run of zero is not a run.
 */
const nextIndexRun = (
  held: IndexRun | null, index: number, event: PressModifiers, os: OsKind,
): IndexRun | null => {
  if (held && event.shiftKey) {
    return { indices: runBetween(held.anchor, index), anchor: held.anchor };
  }
  if (held && isPrimaryModifier(event, os)) {
    const indices = held.indices.includes(index)
      ? held.indices.filter((i) => i !== index)
      : [...held.indices, index];
    return indices.length > 0 ? { indices, anchor: index } : null;
  }
  return { indices: [index], anchor: index };
};

export { nextIndexRun, runBetween };
export type { IndexRun, PressModifiers };
