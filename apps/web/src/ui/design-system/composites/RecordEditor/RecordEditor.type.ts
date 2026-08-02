/* @layer renderer-components @kind types */
/**
 * Props for the record editor and everything it recurses through. The binding is
 * an Introduce Parameter Object: a row four levels deep needs exactly the same
 * capabilities as a row at the top, so they travel together rather than as a
 * handful of props re-threaded at every level.
 *
 * Three of those capabilities are INJECTED lookups, and they are all the same
 * shape of bargain: the schema knows a field points at a collection, holds a
 * vocabulary, or carries a number, and it cannot know what any of those hold.
 * A caller that does know supplies a function; without one, every control falls
 * back to what it can do standalone.
 */
import type { FieldDescriptor, SchemaConfig } from '../../data/schema/field-descriptor';
import type { IdRefOptionResolver, NumberBounds } from '../field-kits/registry';

/** What a vocabulary field can already be set to, searched before anything new. */
type TagSuggestionResolver = (field: FieldDescriptor) => readonly string[];

/**
 * What minting a vocabulary term resolved to: the id it was filed under, or why
 * it was refused. The reason travels with the failure rather than being
 * swallowed into a bare null, because a refusal past this package's own
 * convention check — a duplicate, a write the caller could not make — is
 * information only the caller has, and the entry that asked has nowhere else
 * to show it.
 */
type TagCreateResult =
  | { success: true; id: string }
  | { success: false; error: string };

/**
 * Mints a vocabulary term the collection does not hold yet, and reports the id
 * it was filed under. Only the caller can do this: a term becomes a RECORD,
 * and this package writes no records.
 */
type TagCreator = (key: string) => Promise<TagCreateResult>;

/**
 * How far one numeric field may go. It takes the record as well as the path
 * because a limit is not always a fact about the field alone — the same
 * coordinate can be bounded differently depending on what the record IS, and
 * only the caller knows that rule.
 */
type NumberBoundsResolver = (path: string, record: unknown) => NumberBounds | undefined;

interface RecordEditorProps<T> {
  record: T;
  /** Top-level fields; nesting lives in each field's own `children`. */
  schema: readonly FieldDescriptor[];
  /** A diff over the derived schema — layout works fully without it. */
  config?: SchemaConfig;
  /** Omitted means read-only: every control still renders, all disabled, no save. */
  onSave?: (next: T) => Promise<void>;
  disabled?: boolean;
  /**
   * What the collections behind this record's id references hold. Supplying it
   * turns every reference field into a searchable picker; omitting it leaves
   * them the plain id inputs they are on their own.
   */
  resolveIdRefOptions?: IdRefOptionResolver;
  /**
   * The vocabulary behind a tag list. Supplying it lets the tag entry search
   * what exists before creating anything; omitting it still gives the entry,
   * just with nothing to offer.
   */
  resolveTagSuggestions?: TagSuggestionResolver;
  /**
   * How a brand-new vocabulary term gets filed. Supplying it lets a REFERENCED
   * tag list invent a term; omitting it leaves that list to what already
   * exists, which is the honest behaviour when nothing can write.
   */
  onCreateTag?: TagCreator;
  /** Real limits for numeric fields. Omitting it leaves every one of them open. */
  resolveNumberBounds?: NumberBoundsResolver;
  /**
   * What still points at the record being edited, when the caller knows how to
   * ask — an empty array means "checked, nothing does"; omitting the prop
   * means "not applicable to this kind of record", which is what keeps the
   * section off every editor that has no such relationship to show.
   */
  referencedBy?: readonly ReferencedByHit[];
  /**
   * Deletes the record being edited. Supplying it adds a Delete control even
   * when the record has nothing else to save (an unwritable kind can still be
   * deletable); omitting it leaves the record undeletable from here, the same
   * bargain every other injected capability makes.
   */
  onDelete?: () => void;
}

/**
 * One other record whose field still points at the id open in this editor.
 * Mirrors `shared/game/data/relationships/reference-index.ts`'s `ReferenceHit`
 * with a plain `kind` string rather than a branded `EntityKind` — this package
 * has no dataset of its own to import a real one from — and a pre-resolved
 * `label`, because looking up what a record is CALLED is exactly the kind of
 * dataset read this package may not make either.
 */
interface ReferencedByHit {
  kind: string;
  id: string;
  field: string;
  label: string;
}

/** One fieldset's worth of the auto-layout. */
interface EditorGroupModel {
  id: string;
  /** Absent for the single implicit group — one unnamed set needs no heading. */
  label?: string;
  fields: readonly FieldDescriptor[];
}

/** Everything a row needs to read and write one field, whatever its depth. */
interface EditorBinding {
  /** Reads the working copy, never the original record. */
  value: (path: string) => unknown;
  onChange: (path: string, value: unknown) => void;
  isDirty: (path: string) => boolean;
  disabled: boolean;
  /** Passed straight to the kits; absent means every one of them falls back. */
  resolveIdRefOptions?: IdRefOptionResolver;
  /** Absent means a tag entry renders with no vocabulary behind it. */
  resolveTagSuggestions?: TagSuggestionResolver;
  /** Absent means a referenced tag list can only pick what already exists. */
  onCreateTag?: TagCreator;
  /** Already closed over the working record — a row only has to name the path. */
  bounds: (path: string) => NumberBounds | undefined;
}

interface EditorGroupProps {
  group: EditorGroupModel;
  binding: EditorBinding;
  /** 0 at the top level; each nested object or union branch adds one. */
  depth: number;
}

interface EditorRowProps {
  field: FieldDescriptor;
  binding: EditorBinding;
  depth: number;
}

interface ArrayFieldEditorProps {
  /** Kind `array`; its `of` descriptor is a primitive kind. */
  field: FieldDescriptor;
  value: unknown;
  binding: EditorBinding;
}

interface TagArrayEditorProps {
  /** Kind `array` of `string`, named by the tag convention. */
  field: FieldDescriptor;
  value: unknown;
  binding: EditorBinding;
}

interface ObjectArrayEditorProps {
  /** Kind `array`; its `of` descriptor is an `object` with children. */
  field: FieldDescriptor;
  value: unknown;
  binding: EditorBinding;
  /** The array field's own depth — its element rows sit one below it. */
  depth: number;
}

/** The two child descriptors that make an object a grid position, plus the rest. */
interface PositionPair {
  x: FieldDescriptor;
  y: FieldDescriptor;
  /** The keys to write back on, which are the child paths' last segments. */
  xKey: string;
  yKey: string;
  /** Children that are not part of the pair — rendered as their own rows. */
  others: readonly FieldDescriptor[];
}

interface PositionFieldEditorProps {
  /** Kind `object`, holding the pair. */
  field: FieldDescriptor;
  pair: PositionPair;
  binding: EditorBinding;
}

export type {
  ArrayFieldEditorProps, EditorBinding, EditorGroupModel, EditorGroupProps,
  EditorRowProps, NumberBoundsResolver, ObjectArrayEditorProps, PositionFieldEditorProps,
  PositionPair, RecordEditorProps, ReferencedByHit, TagArrayEditorProps, TagCreateResult, TagCreator,
  TagSuggestionResolver,
};
