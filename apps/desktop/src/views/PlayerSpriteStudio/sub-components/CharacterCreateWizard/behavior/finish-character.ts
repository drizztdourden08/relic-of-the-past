/* @layer renderer-components @kind logic */
import type { CreateOutcome } from '@drizztdourden08/tessera/composites';
import { CREATE_FAILED, NEW_SPRITE_ID, NOT_IMPORTED } from '../CharacterCreateWizard.constants';
import type { CharacterWizardValues } from '../CharacterCreateWizard.type';

const finishCharacter = async (
  values: CharacterWizardValues,
  imported: string | null,
  createBlank: () => Promise<boolean>,
): Promise<CreateOutcome> => {
  if (values.source === 'import') {
    return imported === null ? { success: false, error: NOT_IMPORTED } : { success: true, id: imported };
  }
  return (await createBlank()) ? { success: true, id: NEW_SPRITE_ID } : { success: false, error: CREATE_FAILED };
};

export { finishCharacter };
