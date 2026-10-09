/* @layer renderer-app @kind logic */
import { replaceRecord } from '@rotp/game-data';
import type { EntityKind } from '@rotp/game-data';
import type { Unnumbered } from '@rotp/game-data';
import type { WriteRecordArgs, WriteRecordResult } from '@shared/ipc/screen-editor-contract';
import type { RecordWriter } from '../../DataInspector.type';
import { updateIdRefOption } from '../update-id-ref-option';
import { settleWrite } from './settle-write';

const facadeWriter = <T extends { id: string }>(
  kind: EntityKind,
  send: (args: WriteRecordArgs<T>) => Promise<WriteRecordResult>,
): RecordWriter => async (row) => {
  const record = row as unknown as T;
  const { id, ...rest } = record;
  settleWrite(await send({ id, record: rest as Unnumbered<T> }));
  replaceRecord(kind, record);
  updateIdRefOption(kind, id);
};

export { facadeWriter };
