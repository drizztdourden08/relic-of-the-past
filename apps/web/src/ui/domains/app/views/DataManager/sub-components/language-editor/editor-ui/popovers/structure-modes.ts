/* @layer renderer-components @kind constants */
/**
 * The three ways the editor may restructure an entry, in the words a translator
 * chooses between and one line saying what each one will do to their text.
 *
 * The modes themselves, and everything they decide, live with the structural
 * edits in the shared layer; this is only how they are named on screen.
 */
import { STRUCTURE_MODES } from '@shared/game/language';
import type { StructureMode } from '@shared/game/language';
import type { SegmentOption } from '@ds/primitives';

const STRUCTURE_WORDS: Record<StructureMode, string> = {
  continuous: 'Continuous',
  block: 'In block',
  off: 'Off',
};

/** One line each, in the second person: what happens as you type. */
const STRUCTURE_NOTES: Record<StructureMode, string> = {
  continuous: 'Lines flow through the whole entry; breaks and scrolls follow on their own.',
  block: 'Your boxes stay as they are; a line opens only where its box has a free row.',
  off: 'Nothing is restructured; every break in the entry is yours to place.',
};

const STRUCTURE_OPTIONS: SegmentOption<StructureMode>[] = STRUCTURE_MODES.map((mode) => ({
  value: mode,
  label: STRUCTURE_WORDS[mode],
}));

export { STRUCTURE_NOTES, STRUCTURE_OPTIONS, STRUCTURE_WORDS };
