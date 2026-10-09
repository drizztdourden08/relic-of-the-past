/* @layer renderer-app @kind logic */
import { appApi } from '@app/ipc/app-api';
import { screenRecordFile } from '@rotp/game-data';
import { variantBlockers } from '@rotp/game-data';
import type { ScreenRecord } from '@rotp/game-data';
import type { PendingScreenRecord } from '@rotp/game-data';
import type { RecordWriter } from '../../DataInspector.type';
import { pathOf } from './path-of';
import { settleWrite } from './settle-write';

const writeScreen: RecordWriter = async (row) => {
  const { id, ...rest } = row as unknown as ScreenRecord;
  const variantIssue = variantBlockers(rest)[0];
  if (variantIssue) throw new Error(`This screen needs ${variantIssue}.`);
  const filePath = pathOf(screenRecordFile({ id, ...rest }));
  settleWrite(await appApi().screenEditor.writeScreen({
    filePath,
    record: rest as PendingScreenRecord,
    replaceId: id,
  }));
};

export { writeScreen };
