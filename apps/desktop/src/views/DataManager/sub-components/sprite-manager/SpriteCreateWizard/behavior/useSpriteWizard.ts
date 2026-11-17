/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { useWizard } from '@drizztdourden08/tessera/composites';
import { useImportProgress } from '@app/hooks/useImportProgress';
import { INITIAL_VALUES } from '../SpriteCreateWizard.constants';
import type { SpriteWizardValues, UseSpriteWizardParams } from '../SpriteCreateWizard.type';
import { spriteWizardSteps } from './sprite-wizard-steps';

const useSpriteWizard = ({ onExtract, onCreated }: UseSpriteWizardParams) => {
  const progress = useImportProgress('sprite');
  const handleFinish = useCallback((values: SpriteWizardValues) => onExtract(values.romFile), [onExtract]);
  const wizard = useWizard({ steps: spriteWizardSteps, initialValues: INITIAL_VALUES, onFinish: handleFinish, onFinished: onCreated });

  return { wizard, progress };
};

export { useSpriteWizard };
