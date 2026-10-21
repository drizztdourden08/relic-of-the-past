/* @layer renderer-components @kind types */
import type { InstalledPack } from '@rotp/hub-contracts';
import type { LanguageSetSummary } from '@rotp/languages';
import type { LanguageResult } from '@app/storage/languages-store/languages-store.type';

type SelectSet = (code: string | null) => void;

interface LanguageOutcome {
  success: boolean;
  message: string;
}

interface LanguageCreationParams {
  refresh: () => Promise<void>;
  setSelected: SelectSet;
}

interface LanguageExtractionParams {
  refresh: () => Promise<void>;
  setSelected: SelectSet;
}

interface SettleExtractionParams {
  result: LanguageResult;
  refresh: () => Promise<void>;
  setSelected: SelectSet;
}

interface LanguageDeleteParams {
  selected: string | null;
  setSelected: SelectSet;
  refresh: () => Promise<void>;
  packFor: (code: string) => InstalledPack | null;
  confirmUninstall: (pack: InstalledPack, onDone: () => void) => void;
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

interface LanguageManagerDisplayParams {
  languages: LanguageSetSummary[];
  packFor: (code: string) => InstalledPack | null;
}

export type {
  LanguageCreationParams, LanguageDeleteParams, LanguageExtractionParams,
  LanguageManagerDisplayParams, LanguageOutcome, SettleExtractionParams,
};
