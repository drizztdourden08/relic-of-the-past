/* @layer renderer-components @kind logic */
import type { CreateOutcome } from '@drizztdourden08/tessera/composites';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { NEW_SPRITE_ID } from '../CharacterCreateWizard.constants';
import type { CharacterWizardValues } from '../CharacterCreateWizard.type';

const finishCharacter = async (
  values: CharacterWizardValues,
  imported: string | null,
  createBlank: () => Promise<boolean>,
  t: I18n['t'],
): Promise<CreateOutcome> => {
  if (values.source === 'import') {
    return imported === null
      ? { success: false, error: t('views-player-sprite-studio:wizard.notImported') }
      : { success: true, id: imported };
  }
  return (await createBlank())
    ? { success: true, id: NEW_SPRITE_ID }
    : { success: false, error: t('views-player-sprite-studio:wizard.createFailed') };
};

export { finishCharacter };
