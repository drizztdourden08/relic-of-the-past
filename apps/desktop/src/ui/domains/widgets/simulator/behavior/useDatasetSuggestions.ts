/* @layer renderer-widgets @kind hook */
import { useCallback, useMemo } from 'react';
import type { DatasetSuggestion } from '@shared/game/simulation';
import { RECORD_REQUIRED } from '../SimulatorWidget.constants';
import type { ApplyResult, CheckWriter } from '../SimulatorWidget.type';

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
