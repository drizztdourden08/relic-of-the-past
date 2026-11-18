/* @layer renderer-components @kind logic */
import { slugSetId } from '@rotp/languages';
import { PROBLEMS } from '../LanguageCreateWizard.constants';
import type { LanguageWizardValues, StepContext } from '../LanguageCreateWizard.type';
import { isWebAddress } from '../../../is-web-address';
import { romCheckProblem } from '../../../rom-check';

const takenProblem = (id: string): string => `A language set with the id "${id}" already exists. Pick another name.`;

const nameProblem = (values: LanguageWizardValues, context: StepContext): string | null => {
  const name = values.name.trim();
  if (name === '') return PROBLEMS.noName;
  const id = slugSetId(name);
  return context.takenIds.has(id) && id !== context.imported ? takenProblem(id) : null;
};

const romProblem = (values: LanguageWizardValues): string | null => {
  if (values.romFile !== null) return romCheckProblem(values.romFile, values.romCheck);
  const url = values.romUrl.trim();
  if (url === '') return PROBLEMS.noRom;
  return isWebAddress(url) ? null : PROBLEMS.badUrl;
};

const patchedProblem = (values: LanguageWizardValues): string | null =>
  (values.patchedFile === null ? PROBLEMS.noPatchedRom : romCheckProblem(values.patchedFile, values.patchedCheck));

const detailsProblem = (values: LanguageWizardValues, context: StepContext): string | null => {
  if (values.source === 'rom') return romProblem(values);
  if (values.source === 'patched') return nameProblem(values, context) ?? patchedProblem(values);
  return values.baseSet === '' ? PROBLEMS.noBase : nameProblem(values, context);
};

export { detailsProblem };
