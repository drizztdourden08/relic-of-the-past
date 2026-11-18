/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { RomCheck } from './rom-check.type';

const romCheckProblem = (file: File, check: RomCheck | null, t: I18n['t']): string | null => {
  if (check === null || check.file !== file) return t('data-manager:rom-check.still-checking');
  return check.ok ? null : check.message;
};

export { romCheckProblem };
