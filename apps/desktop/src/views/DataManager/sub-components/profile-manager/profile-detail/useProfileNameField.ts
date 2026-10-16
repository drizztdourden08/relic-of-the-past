/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';
import { updateProfile } from '@app/storage/profile-store';

const useProfileNameField = (profile: Profile, onRefresh: () => void) => {
  const [draft, setDraft] = useState(profile.name);
  const [error, setError] = useState<string | null>(null);
  const dirty = draft.trim() !== profile.name;

  useEffect(() => { setDraft(profile.name); }, [profile.name]);

  const revert = useCallback(() => {
    setDraft(profile.name);
    setError(null);
  }, [profile.name]);

  const commit = useCallback(async () => {
    const name = draft.trim();
    if (name === profile.name) return;
    if (name === '') {
      setError('Enter a name.');
      return;
    }
    try {
      await updateProfile(profile.id, { name });
      setError(null);
      onRefresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    }
  }, [draft, profile.id, profile.name, onRefresh]);

  return { draft, setDraft, error, dirty, commit, revert };
};

export { useProfileNameField };
