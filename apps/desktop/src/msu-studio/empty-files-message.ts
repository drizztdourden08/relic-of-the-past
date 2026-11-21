/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';

const emptyFilesMessage = (t: I18n['t'], fileCount: number, supersededOnly: boolean, filter: string): string => {
  if (fileCount === 0) return t('msu-studio:files.empty.none');
  if (supersededOnly) return t('msu-studio:files.empty.superseded');
  return t('msu-studio:files.empty.filter', { filter });
};

export { emptyFilesMessage };
