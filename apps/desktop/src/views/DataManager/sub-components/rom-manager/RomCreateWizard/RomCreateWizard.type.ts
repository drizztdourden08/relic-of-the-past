/* @layer renderer-components @kind types */
import type { WizardApi } from '@drizztdourden08/tessera/composites';
import type { RomKind } from '@rotp/roms';
import type { ImportProgressState } from '@app/hooks/useImportProgress';
import type { RomImportOutcome } from '../rom-manager.type';
import type { RomExtraction } from '../rom-extraction.type';

interface RomWizardValues {
  kind: RomKind;
  file: File | null;
  url: string;
}

type RomWizardApi = WizardApi<RomWizardValues>;

type UpdateValues = (patch: Partial<RomWizardValues>) => void;

interface RomCreateWizardProps {
  extraction: RomExtraction;
  onKindChange: (kind: RomKind) => void;
  onUrlImport: (url: string) => Promise<RomImportOutcome>;
  onFileImport: (files: File[]) => Promise<RomImportOutcome>;
  onCancel: () => void;
  onCreated: (id: string) => void;
}

type UseRomWizardParams = Omit<RomCreateWizardProps, 'onCancel'>;

interface FinishContext {
  onUrlImport: RomCreateWizardProps['onUrlImport'];
  onFileImport: RomCreateWizardProps['onFileImport'];
}

interface StepBodyProps {
  wizard: RomWizardApi;
  extraction: RomExtraction;
  progress: ImportProgressState;
  onKindChange: (kind: RomKind) => void;
}

export type { FinishContext, RomCreateWizardProps, RomWizardApi, RomWizardValues, StepBodyProps, UpdateValues, UseRomWizardParams };
