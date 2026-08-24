/* @layer renderer-components @kind types */
/**
 * Shared state types for the translation editor's data layer: what the editor
 * hook hands the UI (the loaded set, save/dirty flags, per-entry validation),
 * what an edit to the name table looks like, and what a full-set text search
 * returns.
 */
import type {
  EntryIssue, GlossaryTerm, LanguageSet, PauseLabelKey, SetStructure, TextGroupId, Token, Variable,
} from '@shared/game/language';

/** Validation results per dialogue entry, keyed by the entry's own game index. */
type EntryIssueMap = Record<number, EntryIssue[]>;

/** The three name-table groups an editable display string can live in. */
type NameGroup = 'items' | 'bottles' | 'labels';

/**
 * One name-table write, discriminated on the group so every group keeps its
 * own key type: an item record id, a bottle slot number, one of the fixed
 * pause-menu label keys.
 */
type NameEdit =
  | { group: 'items'; key: string; value: string }
  | { group: 'bottles'; key: number; value: string }
  | { group: 'labels'; key: PauseLabelKey; value: string };

/** Every mutation the editor exposes. All immutable, all mark the set dirty. */
type LanguageEditorActions = {
  setEntryTokens: (id: number, tokens: Token[]) => void;
  setEntryNote: (id: number, note: string) => void;
  setNameValue: (edit: NameEdit) => void;
  /** The set's typing-automation reach; part of the set, so an edit like any other. */
  setStructureMode: (mode: SetStructure) => void;
  /** One slot of one text group; an emptied value drops the override. */
  setTextValue: (group: TextGroupId, key: string, value: string) => void;
  upsertGlossaryTerm: (term: GlossaryTerm) => void;
  removeGlossaryTerm: (key: string) => void;
  /**
   * One variable's literal text. Routed to whichever table the variable is
   * projected from; an engine-owned variable has no stored value, so a write to
   * one is ignored rather than landing where nothing would read it.
   */
  setVariableValue: (variable: Variable, value: string) => void;
  /** Replaces several entries' streams in one pass (the hardcoded-name apply). */
  setManyEntryTokens: (edits: { entryId: number; tokens: Token[] }[]) => void;
  /** Flush a pending debounced write immediately (a Save button, a tab change). */
  saveNow: () => Promise<void>;
};

/** The full editor surface: loaded data, live status, and the mutations. */
type LanguageEditorState = LanguageEditorActions & {
  set: LanguageSet | null;
  loading: boolean;
  /** Load failure — a missing set id, or an unreadable payload. */
  error: string | null;
  /** Edits exist that the debounced write has not persisted yet. */
  dirty: boolean;
  /** A write is in flight (which also recompiles the asset blobs). */
  saving: boolean;
  saveError: string | null;
  issues: EntryIssueMap;
  /**
   * The set's one substitution list, projected live from the pair it is stored
   * as, so an edit to a term or a menu name shows here without a save first.
   */
  variables: Variable[];
  /**
   * Every variable that carries text of its own, in the shape the measurement
   * and validation walks take. Wider than `set.glossary`: a menu name may now
   * be referenced from a line, and a walk given only the glossary would fail on
   * one.
   */
  terms: GlossaryTerm[];
};

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

export type {
  EntryIssueMap, LanguageEditorActions, LanguageEditorState, NameEdit, NameGroup,
  SearchField, SearchHit, SearchHitKind, TranslationSearchState,
};
