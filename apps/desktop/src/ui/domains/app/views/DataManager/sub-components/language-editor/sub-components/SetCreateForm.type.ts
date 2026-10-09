/* @layer renderer-components @kind types */
import type { LanguageSetSummary } from '@shared/storage/languages';

type SetCreateFormProps = {
  sets: LanguageSetSummary[];
  busy?: boolean;
  onCreate: (id: string, name: string, base: string) => void;
  onDuplicate: (sourceId: string, id: string, name: string) => void;
};

export type { SetCreateFormProps };
