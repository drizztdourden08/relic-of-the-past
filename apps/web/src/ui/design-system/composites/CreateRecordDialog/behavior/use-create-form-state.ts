/* @layer renderer-components @kind hook */
/**
 * The working draft and the submit flow for a create dialog, the create-flow
 * analogue of `RecordEditor`'s own `use-record-editor-state`. Simpler in one way
 * (there is no baseline to compare against, since every field starts absent or
 * blank, so "dirty" is not a question this form asks) and stricter in another:
 * a save here is gated on every required path holding a value, not merely on
 * something having changed.
 */
import { useCallback, useEffect, useState } from 'react';
import { getPath, setPath } from '../../../data/schema/path';
import type { CreateOutcome } from '../CreateRecordDialog.type';

interface CreateFormStateParams<T> {
  initialRecord: T;
  requiredPaths: readonly string[];
  /** Reopening (or a different collection behind the same dialog) starts over. */
  open: boolean;
  onCreate: (record: T) => Promise<CreateOutcome>;
}

const isFilled = (value: unknown): boolean => {
  if (value === undefined || value === null) return false;
  return !(typeof value === 'string' && value.trim() === '');
};

const useCreateFormState = <T,>(params: CreateFormStateParams<T>) => {
  const { initialRecord, requiredPaths, open, onCreate } = params;
  const [working, setWorking] = useState<T>(initialRecord);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A fresh open is what resets the draft, not every identity change of the initial record.
  useEffect(() => {
    if (!open) return;
    setWorking(initialRecord);
    setError(null);
  }, [open]);

  const setValue = useCallback((path: string, value: unknown) => {
    setWorking((previous) => setPath(previous, path, value));
  }, []);

  const isComplete = requiredPaths.every((path) => isFilled(getPath(working, path)));

  const handleCreate = useCallback(async (): Promise<string | null> => {
    setSaving(true);
    setError(null);
    try {
      const result = await onCreate(working);
      if (!result.success) {
        setError(result.error);
        return null;
      }
      return result.id;
    } catch (thrown: unknown) {
      setError(thrown instanceof Error ? thrown.message : 'Create failed');
      return null;
    } finally {
      setSaving(false);
    }
  }, [onCreate, working]);

  return {
    working, setValue, isComplete, saving, error, handleCreate,
  };
};

export { useCreateFormState };
