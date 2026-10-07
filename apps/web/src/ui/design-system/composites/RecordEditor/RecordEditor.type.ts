/* @layer renderer-components @kind types */
/**
 * Props for the record editor and everything it recurses through. The binding
 * travels as one object because a nested row needs the same capabilities as a
 * top-level one. The injected lookups all make the same bargain: a caller that
 * knows the dataset supplies a function; without one, the control falls back
 * to what it can do standalone.
 */
import type { FieldDescriptor, SchemaConfig } from '../../data/schema/field-descriptor';
import type { IdRefOptionResolver, NumberBounds } from '../field-kits/registry';

/** What a vocabulary field can already be set to, searched before anything new. */
type TagSuggestionResolver = (field: FieldDescriptor) => readonly string[];

/** The id a minted term was filed under, or why it was refused. The reason travels because only the caller knows it. */
type TagCreateResult =
  | { success: true; id: string }
  | { success: false; error: string };

/** Mints a vocabulary term and reports its id. Only the caller can do this; a term becomes a record, and this package writes none. */
type TagCreator = (key: string) => Promise<TagCreateResult>;

/** How far one numeric field may go. Takes the record too, since the same coordinate can be bounded differently per record. */
type NumberBoundsResolver = (path: string, record: unknown) => NumberBounds | undefined;

interface RecordEditorProps<T> {
  record: T;
  /** Top-level fields; nesting lives in each field's own `children`. */
  schema: readonly FieldDescriptor[];
  /** A diff over the derived schema. Layout works fully without it. */
  config?: SchemaConfig;
  /** Omitted means read-only: every control still renders, all disabled, no save. */
  onSave?: (next: T) => Promise<void>;
  disabled?: boolean;
  /** Paths this record already differs on before any edit here. Rendered distinctly from the dirty marker: "somebody else changed this" vs "you did". */
  changedPaths?: readonly string[];
  /** What the referenced collections hold. Supplied, reference fields become searchable pickers; omitted, they stay plain id inputs. */
  resolveIdRefOptions?: IdRefOptionResolver;
  /** The vocabulary behind a tag list. Omitted, the entry has nothing to offer. */
  resolveTagSuggestions?: TagSuggestionResolver;
  /** How a new vocabulary term gets filed. Omitted, a referenced tag list can only pick what exists. */
  onCreateTag?: TagCreator;
  /** Real limits for numeric fields. Omitted, every one of them is open. */
  resolveNumberBounds?: NumberBoundsResolver;
  /** What still points at this record. Empty array: checked, nothing does. Omitted: not applicable, section hidden. */
  referencedBy?: readonly ReferencedByHit[];
  /** Deletes the record. Supplied, adds a Delete control even with nothing else to save. */
  onDelete?: () => void;
}

/**
 * One other record still pointing at the id open here. Mirrors `ReferenceHit`
 * in `shared/game/data/relationships/reference-index.ts` with a plain `kind`
 * string and a pre-resolved `label`, since this package has no dataset to read.
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
  /** Absent for the single implicit group, because one unnamed set needs no heading. */
  label?: string;
  fields: readonly FieldDescriptor[];
}

/** Everything a row needs to read and write one field, whatever its depth. */
interface EditorBinding {
  /** Reads the working copy, never the original record. */
  value: (path: string) => unknown;
  onChange: (path: string, value: unknown) => void;
  isDirty: (path: string) => boolean;
  /** Changed by whatever produced this record, before any edit here. */
  isChanged?: (path: string) => boolean;
  disabled: boolean;
  /** Passed straight to the kits; absent means every one of them falls back. */
  resolveIdRefOptions?: IdRefOptionResolver;
  /** Absent means a tag entry renders with no vocabulary behind it. */
  resolveTagSuggestions?: TagSuggestionResolver;
  /** Absent means a referenced tag list can only pick what already exists. */
  onCreateTag?: TagCreator;
  /** Already closed over the working record, so a row only has to name the path. */
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
  /** The array field's own depth. Its element rows sit one below. */
  depth: number;
}

/** The two child descriptors that make an object a grid position, plus the rest. */
interface PositionPair {
  x: FieldDescriptor;
  y: FieldDescriptor;
  /** The keys to write back on, which are the child paths' last segments. */
  xKey: string;
  yKey: string;
  /** Children outside the pair, which render as their own rows. */
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
