/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';
import {
  absorbPort, draftError, draftOf, isSameDraft, patchOf, withHost,
} from '@app/hooks/randomizer/server-setup/server-setup-draft';
import { useServerProbe } from '@app/hooks/randomizer/server-setup/useServerProbe';
import type { ServerSetupDraft } from '@app/hooks/randomizer/server-setup/server-setup-draft';
import type { ConnectionForm, ConnectionFormParams } from './useConnectionForm.type';

const useConnectionForm = ({ config, onSave }: ConnectionFormParams): ConnectionForm => {
  const saved = draftOf(config);
  const [edit, setEdit] = useState<ServerSetupDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const draft = edit ?? saved;
  const probe = useServerProbe(draft);

  useEffect(() => {
    const savedElsewhereOntoEdit = edit !== null && isSameDraft(edit, saved);
    if (savedElsewhereOntoEdit) setEdit(null);
  }, [edit, saved]);

  const change = useCallback((part: Partial<ServerSetupDraft>) => setEdit({ ...draft, ...part }), [draft]);
  const changeHost = useCallback((host: string) => setEdit(withHost(draft, host)), [draft]);
  const settleHost = useCallback(() => setEdit(absorbPort(draft)), [draft]);
  const revert = useCallback(() => {
    setEdit(null);
    setError(null);
  }, []);

  const save = useCallback(async () => {
    const settled = absorbPort(draft);
    setEdit(settled);
    const problem = draftError(settled);
    setError(problem);
    if (problem !== null) return;
    setSaving(true);
    try {
      await onSave(patchOf(settled));
      setEdit(null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setSaving(false);
    }
  }, [draft, onSave]);

  const dirty = edit !== null && !isSameDraft(edit, saved);
  return { draft, dirty, error, saving, probe, change, changeHost, settleHost, revert, save };
};

export { useConnectionForm };
export type { ConnectionForm, ConnectionFormParams };
