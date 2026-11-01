/* @layer renderer-components @kind component */
import { Button, Icon } from '@drizztdourden08/tessera/primitives';
import { useRevealProfileFolder } from '@app/hooks/useRevealProfileFolder';

const ProfileFolderButton = ({ profileId }: { profileId: string }) => {
  const { reveal, canReveal } = useRevealProfileFolder(profileId);

  if (!canReveal) return null;
  return <Button variant="secondary" icon={<Icon name="folder-open" />} onClick={reveal}>Open folder</Button>;
};

export { ProfileFolderButton };
