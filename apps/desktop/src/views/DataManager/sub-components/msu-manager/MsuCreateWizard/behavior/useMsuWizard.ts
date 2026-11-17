/* @layer renderer-components @kind hook */
import { useCallback, useMemo } from 'react';
import { useWizard } from '@drizztdourden08/tessera/composites';
import { useImportProgress } from '@app/hooks/useImportProgress';
import { usePackImport } from '../../../../../../msu-studio/behavior/usePackImport';
import { INITIAL_VALUES } from '../MsuCreateWizard.constants';
import type { MsuWizardValues, UseMsuWizardParams } from '../MsuCreateWizard.type';
import { finishPack } from './finish-pack';
import { keepSelection } from './keep-selection';
import { msuWizardSteps } from './msu-wizard-steps';

const useMsuWizard = ({ refresh, isTaken, onCreated }: UseMsuWizardParams) => {
  const progress = useImportProgress('msu');
  const { importMsul } = usePackImport({ refresh, onImported: keepSelection });
  const steps = useMemo(() => msuWizardSteps(isTaken), [isTaken]);

  const handleFinish = useCallback(
    (values: MsuWizardValues) => finishPack(values, { refresh, importMsul }),
    [refresh, importMsul],
  );

  const wizard = useWizard({ steps, initialValues: INITIAL_VALUES, onFinish: handleFinish, onFinished: onCreated });

  return { wizard, progress };
};

export { useMsuWizard };
