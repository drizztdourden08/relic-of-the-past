/* @layer renderer-components @kind types */
import type { InstalledPack } from '@rotp/hub-contracts';

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
  result: { success: boolean; error?: string };
  code: string;
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

interface ExtractLanguagePickerProps {
  value: string;
  onChange: (code: string) => void;
}

export type {
  ExtractLanguagePickerProps, LanguageCreationParams, LanguageDeleteParams, LanguageExtractionParams,
  LanguageOutcome, SettleExtractionParams,
};
