/* @layer renderer-components @kind hook */
/**
 * The working copy, the dirty question and the save flow — the two pieces of
 * real logic in this composite, kept out of the components that render it.
 *
 * Edits never touch the record that was passed in. Every write goes through
 * `setPath`, which returns a new record cloned along the written path only, so
 * the original stays intact for the dirty comparison and untouched branches stay
 * shared rather than copied.
 *
 * A successful save adopts the working copy as the new baseline. The caller
 * usually hands back a fresh record afterwards, but it does not have to, and a
 * form that stayed dirty after a save that worked would be a lie.
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

  // A different record means a different subject — drop the draft and the error
  // with it rather than carrying either across.
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
