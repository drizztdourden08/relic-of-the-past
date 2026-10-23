/* @layer renderer-components @kind logic */
import { matchesText } from '@drizztdourden08/tessera/data';
import type { DirectoryRow } from '../ControllerDirectory.type';

const matchDirectoryRow = (row: DirectoryRow, query: string): boolean =>
  matchesText(`${row.name} ${row.vidPid}`, query);

export { matchDirectoryRow };
