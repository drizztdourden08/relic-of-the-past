/* @layer renderer-components @kind logic */
import { PROBLEMS } from '../RomCreateWizard.constants';
import type { RomWizardValues } from '../RomCreateWizard.type';
import { isWebAddress } from '../../../is-web-address';
import { romCheckProblem } from '../../../rom-check';

const fileProblem = (values: RomWizardValues): string | null => {
  if (values.file !== null) return romCheckProblem(values.file, values.check);
  const url = values.url.trim();
  if (url === '') return PROBLEMS.noFile;
  return isWebAddress(url) ? null : PROBLEMS.badUrl;
};

export { fileProblem };
