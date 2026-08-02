/* @layer renderer-components @kind types */
/**
 * The schema every consumer reads. A field is either a leaf or a node with
 * children, uniformly (Composite pattern) — so a filter picker, a column menu
 * and an editor all walk the same recursive structure to any depth.
 *
 * These types are deliberately domain-agnostic: nothing here knows what a
 * collection holds. A caller supplies rows and, optionally, a config diff.
 */

type FieldKind =
  | 'string'
  | 'number'
  | 'boolean'
  /** Small closed set of literals — a multi-select control. */
  | 'enum'
  /** A `<prefix>-<digits>` reference to another collection; the prefix IS the target. */
  | 'idRef'
  /** Element descriptor is carried in `of`. */
  | 'array'
  /** Has `children` — drills down. */
  | 'object'
  /** Variant shapes under one path — `children` is the merged branch set. */
  | 'union'
  /** Honest fallback: read-only, existence operators only. */
  | 'unknown';

interface FieldDescriptor {
  /** Dot path, e.g. `gameId.roomIndex` — the stable identity used everywhere. */
  path: string;
  /** Derived from the last segment; a config may override it. */
  label: string;
  kind: FieldKind;
  /** Absent on at least one sampled record. */
  optional: boolean;
  /** enum: the observed closed set. */
  options?: readonly string[];
  /**
   * idRef: the id prefix shared by every observed value, which names the
   * collection it points at. A plain string on purpose — this package never
   * imports a domain type.
   */
  targetKind?: string;
  /**
   * array: the element descriptor. Its `path` ends in `[]` and is descriptive
   * only — element paths are not addressable and never appear in `all()`.
   */
  of?: FieldDescriptor;
  /** object | union — the recursion lives here. */
  children?: readonly FieldDescriptor[];
  /** Editor fieldset id, attached from the config's `groups`. */
  group?: string;
  /** Config-hidden: still a valid path, just not offered by default. */
  hidden?: boolean;
}

interface FieldGroup {
  id: string;
  label: string;
  paths: readonly string[];
}

/** A DIFF over the derived base, never a replacement. */
interface SchemaConfig {
  /** Paths, first wins; unlisted keep their derived order and follow. */
  order?: readonly string[];
  groups?: readonly FieldGroup[];
  labels?: Record<string, string>;
  hidden?: readonly string[];
  /** Force a kind that inference got wrong. */
  kinds?: Record<string, FieldKind>;
  /** Initial visible column set. */
  defaultColumns?: readonly string[];
}

/** The single interface a caller implements. Everything else is derived. */
interface CollectionSource<T> {
  id: string;
  label: string;
  rows: readonly T[];
  getId: (row: T) => string;
  config?: SchemaConfig;
  /** Source text for a code tab. */
  serialize?: (row: T) => string;
  /** Omitted means the editor is read-only. */
  onSave?: (row: T) => Promise<void>;
}

export type { CollectionSource, FieldDescriptor, FieldGroup, FieldKind, SchemaConfig };
