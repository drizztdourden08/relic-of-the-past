/* @layer renderer-other @kind hook */
import { useCallback } from 'react';
import { usePlatform } from '@drizztdourden08/brock-react';
import { log } from '@app/log-bus';

const useRevealProfileFolder = (profileId: string) => {
  const { storage, capabilities } = usePlatform();

  const reveal = useCallback(() => {
    storage.revealProfile(profileId)
      .then((opened) => { if (!opened) log.app('Could not open the profile folder', 'warn'); })
      .catch((e: unknown) => log.app(`Could not open the profile folder: ${e instanceof Error ? e.message : String(e)}`, 'error'));
  }, [storage, profileId]);

  return { reveal, canReveal: capabilities.revealDataFolder };
};

export { useRevealProfileFolder };
