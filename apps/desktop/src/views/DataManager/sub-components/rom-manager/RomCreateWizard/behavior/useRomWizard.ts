/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { useWizard } from '@drizztdourden08/tessera/composites';
import { useImportProgress } from '@app/hooks/useImportProgress';
import { INITIAL_VALUES } from '../RomCreateWizard.constants';
import type { RomWizardValues, UseRomWizardParams } from '../RomCreateWizard.type';
import { finishRom } from './finish-rom';
import { ROM_WIZARD_STEPS } from './rom-wizard-steps';

const useRomWizard = ({ onUrlImport, onFileImport, onCreated }: UseRomWizardParams) => {
  const progress = useImportProgress('rom');
  const handleFinish = useCallback((values: RomWizardValues) => finishRom(values, { onUrlImport, onFileImport }),
    [onUrlImport, onFileImport]);
  const wizard = useWizard({ steps: ROM_WIZARD_STEPS, initialValues: INITIAL_VALUES, onFinish: handleFinish, onFinished: onCreated });

  return { wizard, progress };
};

export { useRomWizard };
