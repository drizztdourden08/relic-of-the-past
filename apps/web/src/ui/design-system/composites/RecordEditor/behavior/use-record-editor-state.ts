/* @layer renderer-components @kind hook */
/**
 * The working copy, the dirty question and the save flow. Edits never touch
 * the record passed in: `setPath` clones along the written path only. A
 * successful save adopts the working copy as the new baseline, so the form
 * does not stay dirty when the caller hands back no fresh record.
 */
import { useCallback, useEffect, useState } from 'react';
import { setPath } from '../../../data/schema/path';
import { hasPathChanged } from './dirty-paths';

interface RecordEditorStateParams<T> {
  record: T;
  onSave?: (next: T) => Promise<void>;
}

/** The empty path addresses the record itself. */
const WHOLE_RECORD = '';
const SAVE_FAILED = 'Save failed';

const useRecordEditorState = <T,>(params: RecordEditorStateParams<T>) => {
  const { record, onSave } = params;
  const [baseline, setBaseline] = useState<T>(record);
  const [working, setWorking] = useState<T>(record);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // A different record is a different subject: drop the draft and the error.
  useEffect(() => {
    setBaseline(record);
    setWorking(record);
    setSaveError(null);
  }, [record]);

  const setValue = useCallback((path: string, value: unknown) => {
    setWorking((previous) => setPath(previous, path, value));
  }, []);

  const isPathDirty = useCallback(
    (path: string) => hasPathChanged(baseline, working, path),
    [baseline, working],
  );

  const revert = useCallback(() => {
    setWorking(baseline);
    setSaveError(null);
  }, [baseline]);

  const handleSave = useCallback(async () => {
    if (!onSave) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(working);
      setBaseline(working);
    } catch (error: unknown) {
      setSaveError(error instanceof Error ? error.message : SAVE_FAILED);
    } finally {
      setSaving(false);
    }
  }, [onSave, working]);

  return {
    working,
    isDirty: hasPathChanged(baseline, working, WHOLE_RECORD),
    isPathDirty,
    saving,
    saveError,
    setValue,
    revert,
    handleSave,
  };
};

export { useRecordEditorState };
export type { RecordEditorStateParams };
