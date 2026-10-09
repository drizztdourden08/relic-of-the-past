/* @layer renderer-components @kind logic */
import type { LogRow } from '@drizztdourden08/tessera/composites';
import { TAG_ARROW } from './randomizer-log-style.constants';

const rowsToText = (rows: readonly LogRow[]): string =>
  rows.map((row) => `${row.gutter}\t${row.tag.replace(TAG_ARROW, '')}\t${row.message}`).join('\n');

export { rowsToText };
