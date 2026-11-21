/* @layer renderer-components @kind logic */
import type { CreateOutcome } from '@drizztdourden08/tessera/composites';
import type { Text } from '@drizztdourden08/brock-core/i18n';
import * as msuStore from '@app/storage/msu-store';
import { isMsulName } from '../../../../../../msu-studio/behavior/is-msul-name';
import type { MsuWizardValues } from '../MsuCreateWizard.type';
import type { FinishContext } from './finish-pack.type';

const errorOf = (error: Text | undefined, context: FinishContext, failure: string): string => {
  if (error === undefined) return failure;
  return typeof error === 'string' ? error : context.t(error.key);
};

const settled = async (name: string, context: FinishContext, result: { success: boolean; error?: Text }, failure: string): Promise<CreateOutcome> => {
  if (!result.success) return { success: false, error: errorOf(result.error, context, failure) };
  await context.refresh();
  return { success: true, id: name };
};

const importedFile = async (name: string, file: File, context: FinishContext): Promise<CreateOutcome> => {
  if (!isMsulName(file.name)) return settled(name, context, await msuStore.importMsuFile(name, file), context.t('wizards:msu.failure.import'));
  const result = await context.importMsul(file, name);
  return result.success ? { success: true, id: name } : { success: false, error: result.message };
};

const finishPack = async (values: MsuWizardValues, context: FinishContext): Promise<CreateOutcome> => {
  const name = values.name.trim();
  try {
    if (values.source === 'url') return await settled(name, context, await msuStore.importMsu(name, values.url.trim()), context.t('wizards:msu.failure.download'));
    if (values.source === 'file' && values.file !== null) return await importedFile(name, values.file, context);
    await msuStore.createMsuPack(name);
    await context.refresh();
    return { success: true, id: name };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : context.t('wizards:msu.failure.create') };
  }
};

export { finishPack };
