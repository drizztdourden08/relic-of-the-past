/* @layer renderer-components @kind types */
/** What a full-set text search over a language set returns. */

/** The three name-table groups a display string can live in. */
type NameGroup = 'items' | 'bottles' | 'labels';

/** Which part of the set a search hit was found in. */
type SearchHitKind = 'dialogue' | 'glossary' | 'name';

/**
 * Which field inside that record matched: a dialogue entry's plain text runs,
 * its translator note, one of its control/reference chips, or a glossary /
 * name-table key or value.
 */
type SearchField = 'text' | 'note' | 'chip' | 'key' | 'value';

/** One search result, carrying enough to navigate straight to its source. */
type SearchHit = {
  kind: SearchHitKind;
  /** Jump target: the entry id as a string, a glossary key, or `<group>:<key>`. */
  id: string;
  field: SearchField;
  /** Set only for dialogue hits, so a row can scroll itself into view. */
  entryId: number | null;
  /** Set only for name hits. */
  group: NameGroup | null;
  /** Single-line excerpt with the match in context. */
  preview: string;
};

/** What the search hook returns: the hits plus what the UI needs to label them. */
type TranslationSearchState = {
  hits: SearchHit[];
  count: number;
  /** The query the hits actually reflect (post-debounce), trimmed. */
  applied: string;
  /** The typed query has not reached the hits yet. */
  pending: boolean;
};

export type { NameGroup, SearchField, SearchHit, SearchHitKind, TranslationSearchState };
