/* @layer renderer-components @kind types */
import type { LanguageSetSummary } from '@shared/storage/languages';

interface LanguageSetListProps {
  sets: LanguageSetSummary[];
  selected: string | null;
  labelOf: (set: LanguageSetSummary) => string;
  isInstalled: (id: string) => boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export type { LanguageSetListProps };
