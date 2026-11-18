/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';

interface FileColumn {
  id: string;
  label: Message | null;
}

const NO_USES: string[] = [];

const COLUMNS: FileColumn[] = [
  { id: 'name', label: msg('msu-studio:files.columns.name') },
  { id: 'format', label: msg('msu-studio:files.columns.format') },
  { id: 'size', label: msg('msu-studio:files.columns.size') },
  { id: 'length', label: msg('msu-studio:files.columns.length') },
  { id: 'rate', label: msg('msu-studio:files.columns.rate') },
  { id: 'repeats', label: msg('msu-studio:files.columns.repeats') },
  { id: 'played-by', label: msg('msu-studio:files.columns.played-by') },
  { id: 'actions', label: null },
];

export { COLUMNS, NO_USES };
export type { FileColumn };
