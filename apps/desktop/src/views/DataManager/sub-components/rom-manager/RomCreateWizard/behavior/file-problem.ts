/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { problems } from '../RomCreateWizard.constants';
import type { RomWizardValues } from '../RomCreateWizard.type';
import { isWebAddress } from '../../../is-web-address';
import { romCheckProblem } from '../../../rom-check';

const fileProblem = (values: RomWizardValues, t: I18n['t']): string | null => {
  if (values.file !== null) return romCheckProblem(values.file, values.check, t);
  const url = values.url.trim();
  if (url === '') return problems(t).noFile;
  return isWebAddress(url) ? null : problems(t).badUrl;
};

export { fileProblem };
