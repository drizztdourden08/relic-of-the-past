/* @layer shared-ipc @kind types */
/**
 * The dev editor's write contract.
 *
 * Two rules are enforced by these types rather than by review:
 *
 *  1. A caller never supplies an id for a NEW record. Every "create" payload
 *     below carries the record shape minus its id; the main process allocates the
 *     next free `<kind>-NNN` and stamps it. `Allocated<T>` is nominal — a renderer
 *     cannot produce one without a round trip through the allocator, so an id
 *     invented from a name, a hex index or a slug has nowhere to go.
 *  2. A caller never supplies record TEXT. The payload is the record itself, and
 *     the main process serializes it with the dataset's own emitter, so the shape
 *     written to disk is whatever the record interface currently says it is.
 */
import type {
  AreaId, AreaRecord, ConnectionId, EntityKind, EnumerationCategory, EnumerationEntry, EnumerationId, ItemGroupId,
  ItemGroupRecord, ItemId, LocationRecord, ScreenId, TagId, TagRecord,
} from '../game/data/types';
import type {
  PendingConnectionRecord, PendingEnumerationRecord, PendingItemGroupRecord, PendingScreenRecord, PendingTagRecord,
  Unnumbered,
} from '../game/data/record-codegen';

declare const ALLOCATED: unique symbol;

/** A value that came back from the id allocator, and therefore cannot be invented. */
type Allocated<T> = T & { readonly [ALLOCATED]: true };

/** New geography, named for display only — the id comes back allocated. */
type AllocateGeographyArgs =
  | { kind: 'area'; randomizerName: string; world: AreaRecord['world'] }
  | { kind: 'location'; randomizerName: string; areaId: AreaId };

type AllocateGeographyResult =
  | { success: true; kind: 'area'; record: Allocated<AreaRecord> }
  | { success: true; kind: 'location'; record: Allocated<LocationRecord> }
  | { success: false; error: string };

/**
 * A new vocabulary term. The caller supplies the KEY and the collections it
 * belongs on, and nothing else: the two levels are split from the key, the
 * labels default to the key's own parts, and the id comes back allocated. A key
 * without a separator is rejected — a term with no namespace has no place in
 * the hierarchy the vocabulary is built on.
 */
interface AllocateTagArgs {
  /** `namespace:value`. */
  key: string;
  appliesTo: readonly TagRecord['appliesTo'][number][];
  /** Display name for the term; defaults to the key's second level. */
  label?: string;
  /** Display name for the namespace; defaults to the key's first level. */
  namespaceLabel?: string;
}

type AllocateTagResult =
  | { success: true; record: Allocated<TagRecord> }
  | { success: false; error: string };

/** Insert a new screen (`replaceId: null`) or rewrite an existing one in place. */
interface WriteScreenArgs {
  /** Relative to shared/game/data/ — derived from ids by record-file-targets.ts. */
  filePath: string;
  record: PendingScreenRecord;
  replaceId: ScreenId | null;
}

type WriteConnectionsArgs =
  | { mode: 'insert'; filePath: string; records: readonly PendingConnectionRecord[] }
  | { mode: 'replace'; filePath: string; connectionId: ConnectionId; record: PendingConnectionRecord }
  | { mode: 'remove'; filePath: string; connectionId: ConnectionId };

type WriteRecordResult =
  | { success: true; ids: readonly string[] }
  | { success: false; error: string };

/**
 * Relabelling or reshaping a tag already on file. There is no insert variant
 * here — a brand-new term is minted through `allocateTag`, which owns id
 * allocation and the convention check; this only ever replaces an id the
 * renderer already has open in the editor.
 */
interface WriteTagArgs {
  tagId: TagId;
  record: PendingTagRecord;
}

/** The delete-guard's actual delete step, once the caller has confirmed it. */
interface DeleteTagArgs {
  tagId: TagId;
}

/**
 * A brand-new item group. `ITEM_GROUP_IDS` still names the seven groups that
 * pre-date this path, but it is no longer a ceiling — any number of groups is
 * a normal, writable collection, and the id comes back allocated like any
 * other new record.
 */
interface AllocateItemGroupArgs {
  label: string;
  memberIds: readonly ItemId[];
}

type AllocateItemGroupResult =
  | { success: true; record: Allocated<ItemGroupRecord> }
  | { success: false; error: string };

/**
 * Relabelling or reshaping an item group already on file — same "replace an id
 * already open, never mint one" bargain as `WriteTagArgs`.
 */
interface WriteItemGroupArgs {
  groupId: ItemGroupId;
  record: PendingItemGroupRecord;
}

interface DeleteItemGroupArgs {
  groupId: ItemGroupId;
}

/**
 * A brand-new closed-set label row. The category names which existing group of
 * values this joins; the id comes back allocated like any other new record.
 */
interface AllocateEnumerationArgs {
  category: EnumerationCategory;
  value: string;
  label: string;
  appliesTo: readonly EntityKind[];
}

type AllocateEnumerationResult =
  | { success: true; record: Allocated<EnumerationEntry> }
  | { success: false; error: string };

/** Relabelling or reshaping an enumeration entry already on file. */
interface WriteEnumerationArgs {
  enumerationId: EnumerationId;
  record: PendingEnumerationRecord;
}

interface DeleteEnumerationArgs {
  enumerationId: EnumerationId;
}

/**
 * The three payloads every remaining collection's write path shares.
 *
 * Screen, connection, tag and item group each grew their own argument shape
 * before the record facade existed, and each carries something of its own (a
 * caller-derived file path, a key to split, a closed id set). The six that came
 * after carry none of that: a record in, an id back, nothing kind-specific in
 * between. So they share one generic trio rather than eighteen near-identical
 * interfaces, and a collection wired up later needs no new shape at all.
 *
 * The same two rules still hold — `Unnumbered<T>` is the only thing a caller may
 * send for something new, and `Allocated<T>` is the only thing that comes back.
 */
interface AllocateRecordArgs<T extends { id: string }> {
  record: Unnumbered<T>;
}

type AllocateRecordResult<T> =
  | { success: true; record: Allocated<T> }
  | { success: false; error: string };

/** Replacing a record already on file — the renderer already has its id open. */
interface WriteRecordArgs<T extends { id: string }> {
  id: T['id'];
  record: Unnumbered<T>;
}

/** The delete-guard's actual delete step, once the caller has confirmed it. */
interface DeleteRecordArgs {
  id: string;
}

export type {
  Allocated, AllocateEnumerationArgs, AllocateEnumerationResult, AllocateGeographyArgs, AllocateGeographyResult,
  AllocateItemGroupArgs, AllocateItemGroupResult, AllocateRecordArgs, AllocateRecordResult, AllocateTagArgs,
  AllocateTagResult, DeleteEnumerationArgs, DeleteItemGroupArgs, DeleteRecordArgs, DeleteTagArgs,
  WriteConnectionsArgs, WriteEnumerationArgs, WriteItemGroupArgs, WriteRecordArgs, WriteRecordResult, WriteScreenArgs,
  WriteTagArgs,
};
