/* @layer renderer-app @kind logic */
import type { InspectorRow } from '../DataInspector.type';

const isRecordRow = <T extends { id: string }>(row: InspectorRow): row is InspectorRow & T =>
  typeof row.id === 'string';

export { isRecordRow };
