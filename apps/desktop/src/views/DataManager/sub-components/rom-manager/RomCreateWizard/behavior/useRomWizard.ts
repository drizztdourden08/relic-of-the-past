/* @layer renderer-components @kind hook */
import { useT } from '@drizztdourden08/brock-react';
import { useCallback, useMemo } from 'react';
import { useWizard } from '@drizztdourden08/tessera/composites';
import { useImportProgress } from '@app/hooks/useImportProgress';
import { INITIAL_VALUES } from '../RomCreateWizard.constants';
import type { RomWizardValues, UseRomWizardParams } from '../RomCreateWizard.type';
import { finishRom } from './finish-rom';
import { romWizardSteps } from './rom-wizard-steps';

const useRomWizard = ({ onUrlImport, onFileImport, onCreated }: UseRomWizardParams) => {
  const t = useT();
  const progress = useImportProgress('rom');
  const handleFinish = useCallback((values: RomWizardValues) => finishRom(values, { onUrlImport, onFileImport }),
    [onUrlImport, onFileImport]);
  const wizard = useWizard({ steps: useMemo(() => romWizardSteps(t), [t]), initialValues: INITIAL_VALUES, onFinish: handleFinish, onFinished: onCreated });

  return { wizard, progress };
};

export { useRomWizard };
