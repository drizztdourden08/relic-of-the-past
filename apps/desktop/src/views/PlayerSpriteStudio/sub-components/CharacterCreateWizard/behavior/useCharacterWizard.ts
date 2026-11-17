/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useState } from 'react';
import { useWizard } from '@drizztdourden08/tessera/composites';
import { INITIAL_VALUES } from '../CharacterCreateWizard.constants';
import type { CharacterWizardValues, ImportOutcome, UseCharacterWizardParams } from '../CharacterCreateWizard.type';
import { characterWizardSteps } from './character-wizard-steps';
import { finishCharacter } from './finish-character';

const useCharacterWizard = ({ canCreate, createBlank, onUrlImport, onFileImport, onCreated }: UseCharacterWizardParams) => {
  const [imported, setImported] = useState<string | null>(null);
  const steps = useMemo(() => characterWizardSteps({ canCreate, imported }), [canCreate, imported]);

  const remember = useCallback((outcome: ImportOutcome): ImportOutcome => {
    if (outcome.success && outcome.name) setImported(outcome.name);
    return outcome;
  }, []);

  const importUrl = useCallback(async (url: string) => remember(await onUrlImport(url)), [onUrlImport, remember]);
  const importFiles = useCallback(async (files: File[]) => remember(await onFileImport(files)), [onFileImport, remember]);

  const handleFinish = useCallback(
    (values: CharacterWizardValues) => finishCharacter(values, imported, createBlank),
    [imported, createBlank],
  );

  const wizard = useWizard({ steps, initialValues: INITIAL_VALUES, onFinish: handleFinish, onFinished: onCreated });

  return { wizard, imported, importUrl, importFiles };
};

export { useCharacterWizard };
