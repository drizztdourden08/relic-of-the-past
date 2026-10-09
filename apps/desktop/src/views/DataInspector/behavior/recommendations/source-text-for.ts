/* @layer renderer-app @kind logic */
import type { DetailTab } from '@drizztdourden08/tessera/data';
import type { InspectorRow, InspectorSource } from '../../DataInspector.type';
import { jsonSourceOf } from '../json-source-of';
import { tsSourceOf } from '../ts-source-of';

const sourceTextFor = (source: InspectorSource, record: InspectorRow, tab: DetailTab): string =>
  (tab === 'ts' ? tsSourceOf(source, record) : jsonSourceOf(record));

export { sourceTextFor };
