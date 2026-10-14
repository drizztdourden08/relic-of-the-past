/* @layer renderer-widgets @kind hook */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { useCallback, useMemo } from 'react';
import type { DatasetSuggestion } from '@rotp/navigation';
import { CHECK_DISABLED_HINT, RECORD_REQUIRED } from '../SimulatorWidget.constants';
import type { ApplyResult, EditorWithOptionalCheck } from '../SimulatorWidget.type';

const useDatasetSuggestions = () => {
  const editor: EditorWithOptionalCheck = requireHostApi().screenEditor;
  const canApplyCheck = useMemo(() => typeof editor.writeCheck === 'function', [editor]);

  const apply = useCallback(async (suggestion: DatasetSuggestion): Promise<ApplyResult> => {
    const { kind, targetFile, targetId, code } = suggestion;
    if (kind === 'connection' || kind === 'screen') return { success: false, error: RECORD_REQUIRED };
    if (!editor.writeCheck) return { success: false, error: CHECK_DISABLED_HINT };
    return editor.writeCheck({ filePath: targetFile, code, checkId: targetId });
  }, [editor]);

  return { apply, canApplyCheck };
};

export { useDatasetSuggestions };
