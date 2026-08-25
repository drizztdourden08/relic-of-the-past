/* @layer shared-game @kind logic */
/**
 * The three ways the editor may restructure an entry, one STRATEGY object each.
 *
 * Every edit in this folder asks the policy the same short list of questions
 * instead of testing the mode itself, so a mode is defined in exactly one place
 * and adding a fourth would not mean hunting down conditionals. The questions
 * are the only three things the modes actually disagree about:
 *
 * - CONTINUOUS treats the whole entry as one flowing stack of lines. Opening a
 *   line is always allowed, and everything after it moves down — across box
 *   boundaries, because a wait clears nothing: the pen is still on the bottom
 *   row when the next box opens, so the honest code for the line after a wait is
 *   a scroll, not a return to row 1.
 * - BLOCK keeps the author's boxes as they are. A line may be opened only while
 *   its box still has a free row, and nothing outside that box is renumbered.
 * - OFF opens no lines at all. The author's structure is theirs to type.
 *
 * What is NOT a question here: whether the row and scroll codes are derived.
 * They are derived in all three modes — that is the point of the feature, and a
 * flag for it would only invite a mode that lets an author hand-type a code the
 * engine then disagrees with. Off means "do not restructure", not "let the codes
 * rot".
 */
import { ROWS_PER_BOX } from '../layout/types';
import type { SetStructure } from '../types';

/**
 * How much of the entry the editor may restructure by itself.
 *
 * The union itself lives with the set's own types, because it is a stored field
 * on the set as well as a behaviour here, and a second copy would be free to
 * drift from the one that gets written to disk. This name is the behavioural
 * reading of it.
 */
type StructureMode = SetStructure;

/** One mode's answers. Every edit reads these rather than the mode name. */
type StructurePolicy = {
  mode: StructureMode;
  /** May a line be opened inside a box that currently holds this many? */
  canOpenLine: (linesInBlock: number) => boolean;
  /** Does an edit's push carry on past the wait that ends its box? */
  cascadesAcrossBlocks: boolean;
  /** Does the derived numbering restart at row 1 after a wait? */
  restartsAtBlock: boolean;
};

const kContinuous: StructurePolicy = {
  mode: 'continuous',
  // A full box is not a wall: the box scrolls, which is the engine's only way
  // to make room, and the numbering pass emits that scroll on its own.
  canOpenLine: () => true,
  cascadesAcrossBlocks: true,
  restartsAtBlock: false,
};

const kBlock: StructurePolicy = {
  mode: 'block',
  canOpenLine: linesInBlock => linesInBlock < ROWS_PER_BOX,
  cascadesAcrossBlocks: false,
  restartsAtBlock: true,
};

const kOff: StructurePolicy = {
  mode: 'off',
  canOpenLine: () => false,
  cascadesAcrossBlocks: false,
  restartsAtBlock: true,
};

const kPolicies: Record<StructureMode, StructurePolicy> = {
  continuous: kContinuous,
  block: kBlock,
  off: kOff,
};

/** Every mode, in the order a chooser should offer them. */
const STRUCTURE_MODES: readonly StructureMode[] = ['continuous', 'block', 'off'];

const policyFor = (mode: StructureMode): StructurePolicy => kPolicies[mode];

export { policyFor, STRUCTURE_MODES };
export type { StructureMode, StructurePolicy };
