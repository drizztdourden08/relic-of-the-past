/* @layer shared-ipc @kind types */
/**
 * The dev editor's write contract. Two rules are enforced by these types:
 *
 *  1. A caller never supplies an id for a NEW record. "Create" payloads carry the record
 *     minus its id; the main process allocates the next free `<kind>-NNN`. `Allocated<T>`
 *     is nominal, so an id invented in the renderer has nowhere to go.
 *  2. A caller never supplies record TEXT. The main process serializes the record with the
 *     dataset's own emitter, so the shape on disk is whatever the record interface says.
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

/** New geography. The name is for display only, and the id comes back allocated. */
type AllocateGeographyArgs =
  | { kind: 'area'; randomizerName: string; world: AreaRecord['world'] }
  | { kind: 'location'; randomizerName: string; areaId: AreaId };

type AllocateGeographyResult =
  | { success: true; kind: 'area'; record: Allocated<AreaRecord> }
  | { success: true; kind: 'location'; record: Allocated<LocationRecord> }
  | { success: false; error: string };

/**
 * A new vocabulary term. The caller supplies only the KEY and the collections it belongs on:
 * the levels are split from the key, labels default to its parts, the id comes back allocated.
 * A key without a separator is rejected (no namespace, no place in the hierarchy).
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
  /** Relative to shared/game/data/. record-file-targets.ts derives it from ids. */
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
 * Minting a new crossing with no existing partner (see `pendingPartnerId` in
 * `data/connections/pending-partner.ts`). Both halves are allocated on ONE `withAllocatedIds`
 * turn and written before either id is observable, so no `toConnectionId` can name a partner
 * that was never written. The halves often sit on different screens, hence two file targets.
 */
interface WriteConnectionPairArgs {
  near: { filePath: string; record: PendingConnectionRecord };
  far: { filePath: string; record: PendingConnectionRecord };
}

type WriteConnectionPairResult =
  | { success: true; nearId: ConnectionId; farId: ConnectionId }
  | { success: false; error: string };

/**
 * Relabelling or reshaping a tag already on file. No insert variant: new terms go through
 * `allocateTag`; this only replaces an id the renderer already has open.
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
 * A new item group. `ITEM_GROUP_IDS` still names the seven groups that pre-date this path,
 * but it is no longer a ceiling; the id comes back allocated like any other new record.
 */
interface AllocateItemGroupArgs {
  label: string;
  memberIds: readonly ItemId[];
}

type AllocateItemGroupResult =
  | { success: true; record: Allocated<ItemGroupRecord> }
  | { success: false; error: string };

/** Relabelling or reshaping an item group already on file; same "replace, never mint" rule as `WriteTagArgs`. */
interface WriteItemGroupArgs {
  groupId: ItemGroupId;
  record: PendingItemGroupRecord;
}

interface DeleteItemGroupArgs {
  groupId: ItemGroupId;
}

/** A new closed-set label row. The category names the group it joins; the id comes back allocated. */
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
 * The three payloads every remaining collection's write path shares. Screen, connection, tag
 * and item group pre-date the record facade and carry something kind-specific; the six that
 * came after are record in, id back, so they share one generic trio. The same two rules hold:
 * `Unnumbered<T>` is all a caller may send for something new, `Allocated<T>` is all that comes back.
 */
interface AllocateRecordArgs<T extends { id: string }> {
  record: Unnumbered<T>;
}

type AllocateRecordResult<T> =
  | { success: true; record: Allocated<T> }
  | { success: false; error: string };

/** Replaces a record already on file, whose id the renderer already has open. */
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
  WriteConnectionPairArgs, WriteConnectionPairResult, WriteConnectionsArgs, WriteEnumerationArgs, WriteItemGroupArgs,
  WriteRecordArgs, WriteRecordResult, WriteScreenArgs, WriteTagArgs,
};
