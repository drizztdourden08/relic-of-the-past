/* @layer renderer-components @kind hook */
import { useEffect, useMemo, useRef } from 'react';
import { createProfileStore } from './create-profile-store';
import type { UseProfileStoreArgs } from './controls-settings.type';

const useProfileStore = ({ settings, onChange, profileId }: UseProfileStoreArgs) => {
  const latest = useRef({ settings, onChange });
  useEffect(() => {
    latest.current = { settings, onChange };
  }, [settings, onChange]);

  return useMemo(() => createProfileStore({ profileId, latest }), [profileId]);
};

export { useProfileStore };
