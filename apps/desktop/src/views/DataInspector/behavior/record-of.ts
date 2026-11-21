/* @layer renderer-app @kind logic */
import { optionText } from '@rotp/randomizer';
import { NOT_A_RECORD } from '../DataInspector.constants';
import type { InspectorRow } from '../DataInspector.type';
import { isRecordRow } from './is-record-row';

const recordOf = <T extends { id: string }>(row: InspectorRow): InspectorRow & T => {
  if (!isRecordRow<T>(row)) throw new Error(optionText(NOT_A_RECORD));
  return row;
};

export { recordOf };
