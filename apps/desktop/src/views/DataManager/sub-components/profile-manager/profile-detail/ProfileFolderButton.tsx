/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Button, Icon } from '@drizztdourden08/tessera/primitives';
import { useRevealProfileFolder } from '@app/hooks/useRevealProfileFolder';

const ProfileFolderButton = ({ profileId }: { profileId: string }) => {
  const t = useT();
  const { reveal, canReveal } = useRevealProfileFolder(profileId);

  if (!canReveal) return null;
  return <Button variant="secondary" icon={<Icon name="folder-open" />} onClick={reveal}>{t('data-manager:profile-manager.profile-folder-button.open-folder')}</Button>;
};

export { ProfileFolderButton };
