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
import type { AreaId, AreaRecord, ConnectionId, LocationRecord, ScreenId } from '../game/data/types';
import type { PendingConnectionRecord, PendingScreenRecord } from '../game/data/record-codegen';

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

export type {
  Allocated, AllocateGeographyArgs, AllocateGeographyResult,
  WriteConnectionsArgs, WriteRecordResult, WriteScreenArgs,
};
