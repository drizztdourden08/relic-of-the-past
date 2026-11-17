/* @layer renderer-components @kind types */
import type { TextOrFile } from '../../../../LanguageCreateWizard.type';

interface TextOrFileFieldProps {
  label: string;
  hint: string;
  dropLabel: string;
  value: TextOrFile;
  onChange: (value: TextOrFile) => void;
}

export type { TextOrFileFieldProps };
