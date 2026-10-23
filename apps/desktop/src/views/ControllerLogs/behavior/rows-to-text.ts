/* @layer renderer-components @kind logic */
import type { LogRow } from '@drizztdourden08/tessera/composites';

const rowsToText = (rows: readonly LogRow[]): string =>
  rows.map((row) => `[${row.gutter}] ${row.tag} ${row.message}`).join('\n');

export { rowsToText };
