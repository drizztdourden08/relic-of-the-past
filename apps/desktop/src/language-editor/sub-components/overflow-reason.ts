/* @layer renderer-components @kind logic */
import { ROW_WIDTH_PX } from '@rotp/languages';
import type { RowFit } from '@rotp/languages';
import type { I18n } from '@drizztdourden08/brock-core/i18n';

const overflowReason = (t: I18n['t'], rows: RowFit[]): string => {
  const over = rows.filter((row) => row.overflow).map((row) => row.row);
  if (over.length === 0) return '';

  return t('language-editor:entry.overflow', { count: over.length, rows: over.join(', '), width: ROW_WIDTH_PX });
};

export { overflowReason };
