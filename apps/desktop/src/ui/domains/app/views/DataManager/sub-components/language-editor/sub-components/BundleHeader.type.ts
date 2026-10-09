/* @layer renderer-components @kind types */
import type { LanguageSet } from '@rotp/languages';

type BundleHeaderProps = {
  set: LanguageSet;
  warnings: number;
  dirty: boolean;
  saving: boolean;
  saveError: string | null;
  readOnly?: boolean;
  onDuplicate?: () => void;
  onSaveNow?: () => void;
  onExport?: () => void;
  exporting?: boolean;
  exportStatus?: string | null;
};

export type { BundleHeaderProps };
