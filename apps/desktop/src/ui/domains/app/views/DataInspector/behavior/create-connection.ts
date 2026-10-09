/* @layer renderer-app @kind logic */
import { appApi } from '@app/ipc/app-api';
import { pendingPartnerId, pendingPartnerScreenId, registerRecord } from '@rotp/game-data';
import { connectionRecordFile } from '@rotp/game-data';
import type { ConnectionKind, ConnectionRecord, ScreenId } from '@rotp/game-data';
import type { PendingConnectionRecord } from '@rotp/game-data';
import { EMPTY_PLACEMENT, NO_SOURCE_FILE } from '../DataInspector.constants';
import { registerIdRefOption } from './register-id-ref-option';
import { resolveRecordLabel } from './record-links';
import { settleCreatedRecord } from './settle-created-record';
import type { CreateOutcome, RecordCreator } from './record-creators.type';

const isOneWay = (near: PendingConnectionRecord): boolean => near.nav?.fromPoint?.oneWay != null;

const partnerShapeFor = (near: PendingConnectionRecord): { kind: ConnectionKind; canExit: boolean } =>
  (near.kind === 'hole' ? { kind: 'drop', canExit: false } : { kind: near.kind, canExit: !isOneWay(near) });

const buildFarHalf = (near: PendingConnectionRecord, farScreenId: ScreenId): PendingConnectionRecord => {
  const { kind, canExit } = partnerShapeFor(near);
  return {
    screenId: farScreenId,
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

const insertSingle = async (near: PendingConnectionRecord, filePath: string): Promise<CreateOutcome> => {
  const result = await appApi().screenEditor.writeConnections({ mode: 'insert', filePath, records: [near] });
  if (!result.success) return { success: false, error: result.error };
  const id = result.ids[0];
  registerCreated({ id, ...near } as unknown as ConnectionRecord);
  return settleCreatedRecord('connection', id);
};

const insertPair = async (
  near: PendingConnectionRecord, nearPath: string, farScreenId: ScreenId,
): Promise<CreateOutcome> => {
  const farTarget = connectionRecordFile(farScreenId);
  if (!farTarget.relativePath) return { success: false, error: farTarget.unresolved ?? NO_SOURCE_FILE };
  const far = buildFarHalf(near, farScreenId);

  const result = await appApi().screenEditor.writeConnectionPair({
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
  if (!target.relativePath) return { success: false, error: target.unresolved ?? NO_SOURCE_FILE };

  const farScreenId = pendingPartnerScreenId(near.toConnectionId);
  return farScreenId
    ? insertPair(near, target.relativePath, farScreenId)
    : insertSingle(near, target.relativePath);
};

export { createConnection };
