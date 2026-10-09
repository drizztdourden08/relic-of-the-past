/* @layer renderer-app @kind logic */
import { appApi } from '@app/ipc/app-api';
import { connectionRecordFile } from '@rotp/game-data';
import type { ConnectionRecord, PendingConnectionRecord } from '@rotp/game-data';
import type { RecordWriter } from '../../DataInspector.type';
import { pathOf } from './path-of';
import { settleWrite } from './settle-write';

const writeConnection: RecordWriter = async (row) => {
  const { id, ...rest } = row as unknown as ConnectionRecord;
  const filePath = pathOf(connectionRecordFile(rest.screenId));
  settleWrite(await appApi().screenEditor.writeConnections({
    mode: 'replace',
    filePath,
    connectionId: id,
    record: rest as PendingConnectionRecord,
  }));
};

export { writeConnection };
