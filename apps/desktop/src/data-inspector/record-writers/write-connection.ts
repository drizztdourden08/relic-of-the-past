/* @layer renderer-app @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { connectionRecordFile } from '@rotp/game-data';
import type { ConnectionRecord } from '@rotp/game-data';
import type { RecordWriter } from '@app/views/DataInspector/DataInspector.type';
import { recordOf } from '@app/views/DataInspector/behavior/record-of';
import { pathOf } from './path-of';
import { settleWrite } from './settle-write';

const writeConnection: RecordWriter = async (row) => {
  const { id, ...rest } = recordOf<ConnectionRecord>(row);
  const filePath = pathOf(connectionRecordFile(rest.screenId));
  settleWrite(await requireHostApi().screenEditor.writeConnections({
    mode: 'replace',
    filePath,
    connectionId: id,
    record: rest,
  }));
};

export { writeConnection };
