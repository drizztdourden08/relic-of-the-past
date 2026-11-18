/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { extensionOf, sanitizeFileName } from './track-file-name';

const renameProblem = (t: I18n['t'], from: string, to: string, taken: Set<string>): string | null => {
  if (to.length === 0) return t('msu-studio:files.rename.empty');
  if (to !== sanitizeFileName(to)) return t('msu-studio:files.rename.bad-chars');
  if (extensionOf(to) !== extensionOf(from)) return t('msu-studio:files.rename.keep-extension');
  if (taken.has(to)) return t('msu-studio:files.rename.taken', { name: to });
  return null;
};

export { renameProblem };
