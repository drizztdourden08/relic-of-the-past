/* @layer renderer-app @kind logic */
/**
 * The connection collection's own create step, split out of record-creators.ts
 * because a connection is never created alone — every `ConnectionRecord`
 * requires a real `toConnectionId` partner (see
 * shared/game/data/types/connection.ts). Two shapes reach here, told apart by
 * `pendingPartnerScreenId`:
 *
 *  - The destination screen already holds a point aimed back at this one
 *    (`buildConnectionRecord` found it): `toConnectionId` already names a real
 *    record, and this is a normal single-record insert through the same
 *    `writeConnections` channel a hand-edited insert uses.
 *  - It does not: `toConnectionId` carries `pendingPartnerId`'s sentinel (see
 *    `data/connections/pending-partner.ts`), naming the screen the missing
 *    partner belongs on. Both halves are minted together through
 *    `writeConnectionPair`, which allocates two ids on one allocator turn and
 *    writes each half to its own screen's file (`connection-pair-writer.ts`
 *    on the main-process side owns the atomicity story).
 *
 * The partner's own kind/canExit mirror the rule the connection-points
 * migration codemod used: a `hole`'s partner is a receive-only `drop`;
 * everything else keeps the same kind and can be exited back through, unless
 * the live observation itself flagged the point one-way. The partner's
 * placement is left empty — the live tiles probe fills it in once the player
 * actually visits that screen.
 */
import { pendingPartnerId, pendingPartnerScreenId, registerRecord } from '@shared/game/data';
import { connectionRecordFile } from '@shared/game/data/record-file-targets';
import { registerIdRefOption } from './id-ref-options';
import { resolveRecordLabel } from './record-links';
import { settleCreatedRecord } from './settle-created-record';
import type { ConnectionKind, ConnectionPlacement, ConnectionRecord, ScreenId } from '@shared/game/data';
import type { PendingConnectionRecord } from '@shared/game/data/record-codegen';
import type { CreateOutcome, RecordCreator } from './record-creators.type';

const NO_TARGET = 'No source file could be derived for this record.';

const EMPTY_PLACEMENT: ConnectionPlacement = { form: 'area', rect: { x: 0, y: 0, w: 0, h: 0 }, tiles: [] };

/** The near point's own nav data is the only signal that overrides the
 *  mirror-the-kind default below — see the file header. */
const isOneWay = (near: PendingConnectionRecord): boolean => near.nav?.fromPoint?.oneWay != null;

/** The partner's kind + canExit, derived the way the migration codemod did:
 *  a hole's landing spot is a receive-only drop; every other kind mirrors,
 *  two-way unless the crossing itself is known to be one-way. */
const partnerShapeFor = (near: PendingConnectionRecord): { kind: ConnectionKind; canExit: boolean } =>
  (near.kind === 'hole' ? { kind: 'drop', canExit: false } : { kind: near.kind, canExit: !isOneWay(near) });

const buildFarHalf = (near: PendingConnectionRecord, farScreenId: ScreenId): PendingConnectionRecord => {
  const { kind, canExit } = partnerShapeFor(near);
  return {
    screenId: farScreenId,
    // Placeholder — connection-pair-writer.ts overwrites this with the real,
    // freshly-allocated near id once both halves are minted.
    toConnectionId: pendingPartnerId(near.screenId),
    kind,
    canExit,
    placement: EMPTY_PLACEMENT,
    dungeonId: near.dungeonId,
    tags: [],
  };
};

const registerCreated = (record: ConnectionRecord): void => {
  registerRecord('connection', record);
  registerIdRefOption('connection', { value: record.id, label: resolveRecordLabel(record.id), description: record.id });
};

/** The already-resolvable case: `toConnectionId` names a real partner record. */
const insertSingle = async (near: PendingConnectionRecord, filePath: string): Promise<CreateOutcome> => {
  const result = await window.api.screenEditor.writeConnections({ mode: 'insert', filePath, records: [near] });
  if (!result.success) return { success: false, error: result.error };
  const id = result.ids[0];
  registerCreated({ id, ...near } as unknown as ConnectionRecord);
  return settleCreatedRecord('connection', id);
};

/** The brand-new-crossing case: mint both halves together. */
const insertPair = async (
  near: PendingConnectionRecord, nearPath: string, farScreenId: ScreenId,
): Promise<CreateOutcome> => {
  const farTarget = connectionRecordFile(farScreenId);
  if (!farTarget.relativePath) return { success: false, error: farTarget.unresolved ?? NO_TARGET };
  const far = buildFarHalf(near, farScreenId);

  const result = await window.api.screenEditor.writeConnectionPair({
    near: { filePath: nearPath, record: near },
    far: { filePath: farTarget.relativePath, record: far },
  });
  if (!result.success) return { success: false, error: result.error };

  registerCreated({ id: result.nearId, ...near, toConnectionId: result.farId } as unknown as ConnectionRecord);
  registerCreated({ id: result.farId, ...far, toConnectionId: result.nearId } as unknown as ConnectionRecord);
  return settleCreatedRecord('connection', result.nearId);
};

const createConnection: RecordCreator = async (draft) => {
  const near = draft as unknown as PendingConnectionRecord;
  const target = connectionRecordFile(near.screenId);
  if (!target.relativePath) return { success: false, error: target.unresolved ?? NO_TARGET };

  const farScreenId = pendingPartnerScreenId(near.toConnectionId);
  return farScreenId
    ? insertPair(near, target.relativePath, farScreenId)
    : insertSingle(near, target.relativePath);
};

export { createConnection };
