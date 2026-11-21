/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { CreateOutcome } from '@drizztdourden08/tessera/composites';
import { slugSetId } from '@rotp/languages';
import { problems } from '../LanguageCreateWizard.constants';
import type { FinishContext, LanguageWizardValues } from '../LanguageCreateWizard.type';

const extracted = async (values: LanguageWizardValues, context: FinishContext): Promise<CreateOutcome> => {
  const { romFile, romUrl } = values;
  const outcome = romFile === null ? await context.onUrlImport(romUrl.trim()) : await context.onFileImport([romFile]);
  if (!outcome.success || outcome.code === undefined) return { success: false, error: outcome.message };
  return { success: true, id: outcome.code };
};

const created = async (values: LanguageWizardValues, context: FinishContext): Promise<CreateOutcome> => {
  const id = slugSetId(values.name);
  const name = values.name.trim();
  if (values.source === 'copy') await context.onDuplicate(values.baseSet, id, name);
  else await context.onCreate(id, name, values.baseSet);
  return { success: true, id };
};

const importedOutcome = (imported: string | null, t: I18n['t']): CreateOutcome =>
  (imported === null ? { success: false, error: problems(t).notImported } : { success: true, id: imported });

const finishLanguage = (values: LanguageWizardValues, context: FinishContext): Promise<CreateOutcome> => {
  if (values.source === 'rom') return extracted(values, context);
  if (values.source === 'patched') return Promise.resolve(importedOutcome(context.imported, context.t));
  return created(values, context);
};

export { finishLanguage };
