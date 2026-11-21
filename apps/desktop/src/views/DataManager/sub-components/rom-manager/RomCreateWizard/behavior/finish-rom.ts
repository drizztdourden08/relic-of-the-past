/* @layer renderer-components @kind logic */
import type { CreateOutcome } from '@drizztdourden08/tessera/composites';
import type { FinishContext, RomWizardValues } from '../RomCreateWizard.type';

const finishRom = async (values: RomWizardValues, context: FinishContext): Promise<CreateOutcome> => {
  const { file, url } = values;
  const outcome = file === null ? await context.onUrlImport(url.trim()) : await context.onFileImport([file]);
  if (!outcome.success || outcome.id === undefined) return { success: false, error: outcome.message };
  return { success: true, id: outcome.id };
};

export { finishRom };
