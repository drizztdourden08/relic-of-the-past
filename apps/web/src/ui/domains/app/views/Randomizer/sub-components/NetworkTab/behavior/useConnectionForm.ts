/* @layer renderer-components @kind hook */
/**
 * The Network page's server setup: a draft of the profile's connection, always open. It
 * follows the profile until the player edits it; Save checks the draft, writes it through
 * `onSave` (which reconnects) and the draft follows the saved values again. Revert drops the
 * edit. A refused write keeps the edit with its reason.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  absorbPort, draftError, draftOf, isSameDraft, patchOf, withHost,
} from '@app/hooks/randomizer/server-setup/server-setup-draft';
import { useServerProbe } from '@app/hooks/randomizer/server-setup/useServerProbe';
import type { ServerSetupDraft } from '@app/hooks/randomizer/server-setup/server-setup-draft';
import type { ServerProbe } from '@app/hooks/randomizer/server-setup/useServerProbe';
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@shared/types/profile';

interface ConnectionFormParams {
  config: ProfileRandomizerConfig;
  onSave: (patch: RandomizerConnectionPatch) => Promise<void>;
}

interface ConnectionForm {
  draft: ServerSetupDraft;
  /** The draft differs from the profile. */
  dirty: boolean;
  error: string | null;
  saving: boolean;
  probe: ServerProbe;
  change: (part: Partial<ServerSetupDraft>) => void;
  changeHost: (host: string) => void;
  settleHost: () => void;
  revert: () => void;
  save: () => Promise<void>;
}

const useConnectionForm = ({ config, onSave }: ConnectionFormParams): ConnectionForm => {
  const saved = draftOf(config);
  const [edit, setEdit] = useState<ServerSetupDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const draft = edit ?? saved;
  const probe = useServerProbe(draft);

  // A save elsewhere (the other screen, a reconnect) that lands on the edit ends it.
  useEffect(() => {
    if (edit !== null && isSameDraft(edit, saved)) setEdit(null);
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
