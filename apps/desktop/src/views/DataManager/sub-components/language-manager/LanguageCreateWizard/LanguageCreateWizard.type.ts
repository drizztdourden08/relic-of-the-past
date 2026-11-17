/* @layer renderer-components @kind types */
import type { WizardApi } from '@drizztdourden08/tessera/composites';
import type { PatchedPartReport, RomLanguage } from '@rotp/asset-extraction';
import type { LanguageSetSummary } from '@rotp/languages';
import type { LanguageOutcome } from '../language-manager.type';

interface TextOrFile {
  mode: 'text' | 'file';
  text: string;
  fileName: string;
}

interface ReleaseItem {
  value: RomLanguage;
  release: string;
  rom: string;
  sha1: string;
}

type LanguageSource = 'rom' | 'patched' | 'copy' | 'blank';

interface LanguageWizardValues {
  source: LanguageSource;
  romFile: File | null;
  romUrl: string;
  patchedFile: File | null;
  name: string;
  release: RomLanguage;
  credits: TextOrFile;
  license: TextOrFile;
  baseSet: string;
}

type LanguageWizardApi = WizardApi<LanguageWizardValues>;

type UpdateValues = (patch: Partial<LanguageWizardValues>) => void;

interface StepContext {
  imported: string | null;
  takenIds: ReadonlySet<string>;
}

interface PatchedRun {
  busy: boolean;
  error: string | null;
  parts: readonly PatchedPartReport[];
  imported: string | null;
  run: () => void;
}

interface FinishContext {
  imported: string | null;
  onUrlImport: (url: string) => Promise<LanguageOutcome>;
  onFileImport: (files: File[]) => Promise<LanguageOutcome>;
  onCreate: (id: string, name: string, base: string) => Promise<void>;
  onDuplicate: (sourceId: string, id: string, name: string) => Promise<void>;
}

interface LanguageCreateWizardProps {
  sets: LanguageSetSummary[];
  baseSets: LanguageSetSummary[];
  refresh: () => Promise<void>;
  onCancel: () => void;
  onCreated: (id: string) => void;
}

type UseLanguageWizardParams = Pick<LanguageCreateWizardProps, 'sets' | 'refresh' | 'onCreated'>;

export type {
  FinishContext, LanguageCreateWizardProps, LanguageSource, LanguageWizardApi, LanguageWizardValues, PatchedRun, StepContext,
  ReleaseItem, TextOrFile, UpdateValues, UseLanguageWizardParams,
};
