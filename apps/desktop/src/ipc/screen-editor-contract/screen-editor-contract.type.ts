/* @layer shared-ipc @kind types */
import type { AreaId, AreaRecord, ConnectionId, EntityKind, EnumerationCategory, EnumerationEntry, EnumerationId, ItemGroupId, ItemGroupRecord, ItemId, LocationRecord, ScreenId, TagId, TagRecord, PendingConnectionRecord, PendingEnumerationRecord, PendingItemGroupRecord, PendingScreenRecord, PendingTagRecord, Unnumbered } from '@rotp/game-data';

declare const allocatedBrand: unique symbol;

type Allocated<T> = T & { readonly [allocatedBrand]: true };

type AllocateGeographyArgs =
  | { kind: 'area'; name: string; world: AreaRecord['world'] }
  | { kind: 'location'; name: string; areaId: AreaId };

type AllocateGeographyResult =
  | { success: true; kind: 'area'; record: Allocated<AreaRecord> }
  | { success: true; kind: 'location'; record: Allocated<LocationRecord> }
  | { success: false; error: string };

interface AllocateTagArgs {
  key: string;
  appliesTo: readonly TagRecord['appliesTo'][number][];
  label?: string;
  namespaceLabel?: string;
}

type AllocateTagResult =
  | { success: true; record: Allocated<TagRecord> }
  | { success: false; error: string };

interface WriteScreenArgs {
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

interface WriteConnectionPairArgs {
  near: { filePath: string; record: PendingConnectionRecord };
  far: { filePath: string; record: PendingConnectionRecord };
}

type WriteConnectionPairResult =
  | { success: true; nearId: ConnectionId; farId: ConnectionId }
  | { success: false; error: string };

interface WriteTagArgs {
  tagId: TagId;
  record: PendingTagRecord;
}

interface DeleteTagArgs {
  tagId: TagId;
}

interface AllocateItemGroupArgs {
  label: string;
  memberIds: readonly ItemId[];
}

type AllocateItemGroupResult =
  | { success: true; record: Allocated<ItemGroupRecord> }
  | { success: false; error: string };

interface WriteItemGroupArgs {
  groupId: ItemGroupId;
  record: PendingItemGroupRecord;
}

interface DeleteItemGroupArgs {
  groupId: ItemGroupId;
}

interface AllocateEnumerationArgs {
  category: EnumerationCategory;
  value: string;
  label: string;
  appliesTo: readonly EntityKind[];
}

type AllocateEnumerationResult =
  | { success: true; record: Allocated<EnumerationEntry> }
  | { success: false; error: string };

interface WriteEnumerationArgs {
  enumerationId: EnumerationId;
  record: PendingEnumerationRecord;
}

interface DeleteEnumerationArgs {
  enumerationId: EnumerationId;
}

interface AllocateRecordArgs<T extends { id: string }> {
  record: Unnumbered<T>;
}

type AllocateRecordResult<T> =
  | { success: true; record: Allocated<T> }
  | { success: false; error: string };

interface WriteRecordArgs<T extends { id: string }> {
  id: T['id'];
  record: Unnumbered<T>;
}

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
