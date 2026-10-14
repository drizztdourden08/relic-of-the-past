/* @layer renderer-app @kind logic */
import type { DetailTab } from '@drizztdourden08/tessera/data';
import type { InspectorRow, InspectorSource } from '@app/views/DataInspector/DataInspector.type';
import { jsonSourceOf } from '@app/views/DataInspector/behavior/json-source-of';
import { tsSourceOf } from '@app/views/DataInspector/behavior/ts-source-of';

const sourceTextFor = (source: InspectorSource, record: InspectorRow, tab: DetailTab): string =>
  (tab === 'ts' ? tsSourceOf(source, record) : jsonSourceOf(record));

export { sourceTextFor };
