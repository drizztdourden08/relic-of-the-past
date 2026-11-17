/* @layer renderer-components @kind types */
import type { WizardApi } from '@drizztdourden08/tessera/composites';
import type { ImportProgressState } from '@app/hooks/useImportProgress';

type MsuSource = 'empty' | 'file' | 'url';

interface MsuWizardValues {
  source: MsuSource;
  name: string;
  file: File | null;
  url: string;
}

type MsuWizardApi = WizardApi<MsuWizardValues>;

type UpdateValues = (patch: Partial<MsuWizardValues>) => void;

interface MsuCreateWizardProps {
  refresh: () => Promise<void>;
  isTaken: (name: string) => boolean;
  onCancel: () => void;
  onCreated: (id: string) => void;
}

type UseMsuWizardParams = Pick<MsuCreateWizardProps, 'refresh' | 'isTaken' | 'onCreated'>;

interface FieldsProps {
  values: MsuWizardValues;
  update: UpdateValues;
}

interface ReviewStepProps {
  wizard: MsuWizardApi;
  progress: ImportProgressState;
}

export type {
  FieldsProps, MsuCreateWizardProps, MsuSource, MsuWizardApi, MsuWizardValues, ReviewStepProps, UpdateValues, UseMsuWizardParams,
};
