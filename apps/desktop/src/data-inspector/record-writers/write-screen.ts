/* @layer renderer-app @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { screenRecordFile, variantBlockers } from '@rotp/game-data';
import type { ScreenRecord } from '@rotp/game-data';
import type { RecordWriter } from '@app/views/DataInspector/DataInspector.type';
import { recordOf } from '@app/views/DataInspector/behavior/record-of';
import { pathOf } from './path-of';
import { settleWrite } from './settle-write';

const writeScreen: RecordWriter = async (row) => {
  const { id, ...rest } = recordOf<ScreenRecord>(row);
  const variantIssue = variantBlockers(rest)[0];
  if (variantIssue) throw new Error(`This screen needs ${variantIssue}.`);
  const filePath = pathOf(screenRecordFile({ id, ...rest }));
  settleWrite(await requireHostApi().screenEditor.writeScreen({
    filePath,
    record: rest,
    replaceId: id,
  }));
};

export { writeScreen };
