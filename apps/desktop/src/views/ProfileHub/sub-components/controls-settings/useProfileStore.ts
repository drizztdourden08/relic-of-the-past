/* @layer renderer-components @kind hook */
import { useEffect, useMemo, useRef } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { createProfileStore } from './create-profile-store';
import type { UseProfileStoreArgs } from './controls-settings.type';

const useProfileStore = ({ settings, onChange, profileId }: UseProfileStoreArgs) => {
  const latest = useRef({ settings, onChange });
  const keyboardName = useT()('profiles:controls.labels.keyboard');
  useEffect(() => {
    latest.current = { settings, onChange };
  }, [settings, onChange]);

  return useMemo(() => createProfileStore({ profileId, latest, keyboardName }), [profileId, keyboardName]);
};

export { useProfileStore };
