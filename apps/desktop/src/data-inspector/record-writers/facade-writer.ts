/* @layer renderer-app @kind logic */
import { replaceRecord } from '@rotp/game-data';
import type { EntityKind } from '@rotp/game-data';
import type { WriteRecordArgs, WriteRecordResult } from '@app/ipc/screen-editor-contract';
import type { RecordWriter } from '@app/views/DataInspector/DataInspector.type';
import { recordOf } from '@app/views/DataInspector/behavior/record-of';
import { updateIdRefOption } from '@app/views/DataInspector/behavior/update-id-ref-option';
import { settleWrite } from './settle-write';

const facadeWriter = <T extends { id: string }>(
  kind: EntityKind,
  send: (args: WriteRecordArgs<T>) => Promise<WriteRecordResult>,
): RecordWriter => async (row) => {
  const record = recordOf<T>(row);
  const { id, ...rest } = record;
  settleWrite(await send({ id, record: rest }));
  replaceRecord(kind, record);
  updateIdRefOption(kind, id);
};

export { facadeWriter };
