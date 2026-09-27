/* @layer renderer-components @kind hook */
/**
 * The connection editor's state: closed, or open on a draft of the profile's connection.
 * Save checks the draft, writes it through `onSave` (which reconnects) and closes; a refused
 * write stays open with its reason.
 */
import { useCallback, useState } from 'react';
import { absorbPort, draftError, draftOf, patchOf } from './connection-draft';
import type { ConnectionDraft } from './connection-draft';
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@shared/types/profile';

interface ConnectionFormParams {
  config: ProfileRandomizerConfig;
  onSave: (patch: RandomizerConnectionPatch) => Promise<void>;
}

interface ConnectionForm {
  draft: ConnectionDraft | null;
  error: string | null;
  saving: boolean;
  open: () => void;
  cancel: () => void;
  change: (part: Partial<ConnectionDraft>) => void;
  /** The host field: a paste of `host:port` splits at once, typing splits on leaving it. */
  changeHost: (host: string) => void;
  settleHost: () => void;
  save: () => Promise<void>;
}

const useConnectionForm = ({ config, onSave }: ConnectionFormParams): ConnectionForm => {
  const [draft, setDraft] = useState<ConnectionDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const open = useCallback(() => {
    setDraft(draftOf(config));
    setError(null);
  }, [config]);
  const cancel = useCallback(() => setDraft(null), []);
  const change = useCallback((part: Partial<ConnectionDraft>) => {
    setDraft((current) => (current === null ? null : { ...current, ...part }));
  }, []);
  const changeHost = useCallback((host: string) => {
    setDraft((current) => {
      if (current === null) return null;
      const next = { ...current, host };
      return host.length - current.host.length > 1 ? absorbPort(next) : next;
    });
  }, []);
  const settleHost = useCallback(() => setDraft((current) => (current === null ? null : absorbPort(current))), []);

  const save = useCallback(async () => {
    if (draft === null) return;
    const settled = absorbPort(draft);
    setDraft(settled);
    const problem = draftError(settled);
    setError(problem);
    if (problem !== null) return;
    setSaving(true);
    try {
      await onSave(patchOf(settled));
      setDraft(null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setSaving(false);
    }
  }, [draft, onSave]);

  return { draft, error, saving, open, cancel, change, changeHost, settleHost, save };
};

export { useConnectionForm };
export type { ConnectionForm, ConnectionFormParams };
