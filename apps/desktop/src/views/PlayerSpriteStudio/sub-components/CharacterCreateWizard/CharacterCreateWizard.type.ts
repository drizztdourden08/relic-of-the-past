/* @layer renderer-components @kind types */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { WizardApi } from '@drizztdourden08/tessera/composites';

type CharacterSource = 'blank' | 'import';

interface CharacterWizardValues {
  source: CharacterSource;
}

type CharacterWizardApi = WizardApi<CharacterWizardValues>;

interface ImportOutcome {
  success: boolean;
  message: string;
  name?: string;
}

interface CharacterCreateWizardProps {
  canCreate: boolean;
  createBlank: () => Promise<boolean>;
  onUrlImport: (url: string) => Promise<ImportOutcome>;
  onFileImport: (files: File[]) => Promise<ImportOutcome>;
  onCancel: () => void;
  onCreated: (id: string) => void;
}

type UseCharacterWizardParams = Omit<CharacterCreateWizardProps, 'onCancel'>;

interface StepContext {
  canCreate: boolean;
  imported: string | null;
  t: I18n['t'];
}

interface StepBodyProps {
  wizard: CharacterWizardApi;
  imported: string | null;
  onUrlImport: CharacterCreateWizardProps['onUrlImport'];
  onFileImport: CharacterCreateWizardProps['onFileImport'];
}

export type {
  CharacterCreateWizardProps, CharacterSource, CharacterWizardValues, ImportOutcome, StepBodyProps, StepContext,
  UseCharacterWizardParams,
};
