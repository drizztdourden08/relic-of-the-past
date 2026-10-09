/* @layer renderer-app @kind logic */
import { screenRecordFile } from '@shared/game/data/record-file-targets';
import { variantBlockers } from '@shared/game/logic/queries/screen-validity';
import type { ScreenRecord } from '@shared/game/data';
import type { PendingScreenRecord } from '@shared/game/data/record-codegen';
import type { RecordWriter } from '../../DataInspector.type';
import { pathOf } from './path-of';
import { settleWrite } from './settle-write';

const writeScreen: RecordWriter = async (row) => {
  const { id, ...rest } = row as unknown as ScreenRecord;
  const variantIssue = variantBlockers(rest)[0];
  if (variantIssue) throw new Error(`This screen needs ${variantIssue}.`);
  const filePath = pathOf(screenRecordFile({ id, ...rest }));
  settleWrite(await window.api.screenEditor.writeScreen({
    filePath,
    record: rest as PendingScreenRecord,
    replaceId: id,
  }));
};

export { writeScreen };
