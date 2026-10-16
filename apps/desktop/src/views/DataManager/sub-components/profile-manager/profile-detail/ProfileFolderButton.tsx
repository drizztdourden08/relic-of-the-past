/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { usePlatform } from '@drizztdourden08/brock-react';
import { Button, Icon } from '@drizztdourden08/tessera/primitives';
import { log } from '@app/log-bus';

const ProfileFolderButton = ({ profileId }: { profileId: string }) => {
  const { storage, capabilities } = usePlatform();

  const handleClick = useCallback(() => {
    storage.revealProfile(profileId)
      .then((opened) => { if (!opened) log.app('Could not open the profile folder', 'warn'); })
      .catch((e: unknown) => log.app(`Could not open the profile folder: ${e instanceof Error ? e.message : String(e)}`, 'error'));
  }, [storage, profileId]);

  if (!capabilities.revealDataFolder) return null;
  return <Button variant="secondary" icon={<Icon name="folder-open" />} onClick={handleClick}>Open folder</Button>;
};

export { ProfileFolderButton };
