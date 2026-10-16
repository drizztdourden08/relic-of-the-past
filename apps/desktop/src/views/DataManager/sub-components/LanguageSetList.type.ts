/* @layer renderer-components @kind types */
import type { LanguageSetSummary } from '@rotp/languages';

interface LanguageSetListProps {
  sets: LanguageSetSummary[];
  loading: boolean;
  selected: string | null;
  labelOf: (set: LanguageSetSummary) => string;
  isInstalled: (id: string) => boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export type { LanguageSetListProps };
