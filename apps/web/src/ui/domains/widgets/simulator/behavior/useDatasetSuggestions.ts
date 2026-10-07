/* @layer renderer-widgets @kind hook */
/**
 * Applies a DatasetSuggestion by routing it to the matching screen-editor writer
 * IPC.
 *
 * Only CHECK suggestions can be applied. The screen and connection channels now
 * take a typed record and allocate the id in the main process; a `DatasetSuggestion`
 * carries a pre-rendered code block instead, which is exactly the pre-migration
 * shape those channels exist to keep out of the dataset. Until the simulator's
 * recorder emits records, those two kinds report that plainly instead of writing
 * text of unknown shape.
 */
import { useCallback, useMemo } from 'react';
import type { DatasetSuggestion } from '@shared/game/simulation';

type ApplyResult = { success: boolean; error?: string };
type CheckWriter = (args: { filePath: string; code: string; checkId: string | null }) => Promise<ApplyResult>;

const RECORD_REQUIRED = 'This suggestion is a code block; the writer now takes a record. '
  + 'Apply it from the Dataset widget, which builds the record.';

const useDatasetSuggestions = () => {
  const editor = window.api.screenEditor as typeof window.api.screenEditor & { writeCheck?: CheckWriter };
  const canApplyCheck = useMemo(() => typeof editor.writeCheck === 'function', [editor]);

  const apply = useCallback(async (suggestion: DatasetSuggestion): Promise<ApplyResult> => {
    const { kind, targetFile, targetId, code } = suggestion;
    if (kind === 'connection' || kind === 'screen') return { success: false, error: RECORD_REQUIRED };
    if (kind === 'check') {
      if (!editor.writeCheck) return { success: false, error: 'Check writing is not available in this build.' };
      return editor.writeCheck({ filePath: targetFile, code, checkId: targetId });
    }
    return { success: false, error: `Unknown suggestion kind: ${kind}` };
  }, [editor]);

  return { apply, canApplyCheck };
};

export { useDatasetSuggestions };
export type { ApplyResult };
