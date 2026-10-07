/* @layer renderer-components @kind constants */
import type { EntryViewMode } from '../../behavior/useEntryView';

/** A reader can read an entry, and see it in the game's box when the set has a font. */
const MODES_WITH_FONT: readonly EntryViewMode[] = ['read', 'preview'];
const MODES_WITHOUT_FONT: readonly EntryViewMode[] = ['read'];

export { MODES_WITH_FONT, MODES_WITHOUT_FONT };
