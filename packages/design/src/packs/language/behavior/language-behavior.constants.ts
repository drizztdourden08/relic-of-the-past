/* @layer renderer-components @kind constants */
import type { BlockDoc } from '@rotp/languages';
import type { EntryLayout, EntryViewMode } from './language-behavior.type';
import type { TranslationSearchState } from './translation-search.type';

const PREVIEW_SPAN = 56;
const NO_BLOCKS: BlockDoc = { blocks: [] };
const EMPTY_LAYOUT: EntryLayout = { rows: [], screens: [], lines: [], blocks: NO_BLOCKS };
const DEFAULT_MODE: EntryViewMode = 'read';
const SEARCH_DEBOUNCE_MS = 180;
const NO_HITS: TranslationSearchState['hits'] = [];

export { DEFAULT_MODE, EMPTY_LAYOUT, NO_HITS, PREVIEW_SPAN, SEARCH_DEBOUNCE_MS };
