/* @layer renderer-widgets @kind hook */
import { requireHostApi, useT } from '@drizztdourden08/brock-react';
import { useCallback, useMemo } from 'react';
import type { DatasetSuggestion } from '@rotp/navigation';
import type { ApplyResult, EditorWithOptionalCheck } from '../SimulatorWidget.type';

const useDatasetSuggestions = () => {
  const t = useT();
  const editor: EditorWithOptionalCheck = requireHostApi().screenEditor;
  const canApplyCheck = useMemo(() => typeof editor.writeCheck === 'function', [editor]);

  const apply = useCallback(async (suggestion: DatasetSuggestion): Promise<ApplyResult> => {
    const { kind, targetFile, targetId, code } = suggestion;
    if (kind === 'connection' || kind === 'screen') return { success: false, error: t('views-simulator:apply.error.record') };
    if (!editor.writeCheck) return { success: false, error: t('views-simulator:apply.error.disabled') };
    return editor.writeCheck({ filePath: targetFile, code, checkId: targetId });
  }, [editor, t]);

  return { apply, canApplyCheck };
};

export { useDatasetSuggestions };
