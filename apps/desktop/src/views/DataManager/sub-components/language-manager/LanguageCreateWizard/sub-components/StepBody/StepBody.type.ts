/* @layer renderer-components @kind types */
import type { ImportProgressState } from '@app/hooks/useImportProgress';
import type { LanguageCreateWizardProps, LanguageWizardApi, PatchedRun } from '../../LanguageCreateWizard.type';

interface StepBodyProps extends Pick<LanguageCreateWizardProps, 'sets' | 'baseSets'> {
  wizard: LanguageWizardApi;
  progress: ImportProgressState;
  patched: PatchedRun;
}

export type { StepBodyProps };
