/* @layer renderer-widgets @kind hook */
/**
 * Applies a DatasetSuggestion by routing it to the matching screen-editor writer
 * IPC. Check writes depend on `screenEditor.writeCheck`, which another agent adds
 * to the api — feature-detected here so the card can disable Apply when absent.
 */
import { useCallback, useMemo } from 'react';
import type { DatasetSuggestion } from '@shared/game/simulation';

type ApplyResult = { success: boolean; error?: string };
type CheckWriter = (args: { filePath: string; code: string; checkId: string | null }) => Promise<ApplyResult>;

const useDatasetSuggestions = () => {
  const editor = window.api.screenEditor as typeof window.api.screenEditor & { writeCheck?: CheckWriter };
  const canApplyCheck = useMemo(() => typeof editor.writeCheck === 'function', [editor]);

  const apply = useCallback(async (suggestion: DatasetSuggestion): Promise<ApplyResult> => {
    const { kind, targetFile, targetId, code } = suggestion;
    if (kind === 'connection') return editor.writeConnections({ filePath: targetFile, code });
    if (kind === 'screen') return editor.writeRegion({ filePath: targetFile, code, screenId: targetId });
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
