/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { slugSetId } from '@rotp/languages';
import { problems } from '../LanguageCreateWizard.constants';
import type { LanguageWizardValues, StepContext } from '../LanguageCreateWizard.type';
import { isWebAddress } from '../../../is-web-address';
import { romCheckProblem } from '../../../rom-check';

const takenProblem = (id: string, t: I18n['t']): string => t('wizards:language.problem.taken', { id });

const nameProblem = (values: LanguageWizardValues, context: StepContext, t: I18n['t']): string | null => {
  const name = values.name.trim();
  if (name === '') return problems(t).noName;
  const id = slugSetId(name);
  return context.takenIds.has(id) && id !== context.imported ? takenProblem(id, t) : null;
};

const romProblem = (values: LanguageWizardValues, t: I18n['t']): string | null => {
  if (values.romFile !== null) return romCheckProblem(values.romFile, values.romCheck, t);
  const url = values.romUrl.trim();
  if (url === '') return problems(t).noRom;
  return isWebAddress(url) ? null : problems(t).badUrl;
};

const patchedProblem = (values: LanguageWizardValues, t: I18n['t']): string | null =>
  (values.patchedFile === null ? problems(t).noPatchedRom : romCheckProblem(values.patchedFile, values.patchedCheck, t));

const detailsProblem = (values: LanguageWizardValues, context: StepContext, t: I18n['t']): string | null => {
  if (values.source === 'rom') return romProblem(values, t);
  if (values.source === 'patched') return nameProblem(values, context, t) ?? patchedProblem(values, t);
  return values.baseSet === '' ? problems(t).noBase : nameProblem(values, context, t);
};

export { detailsProblem };
