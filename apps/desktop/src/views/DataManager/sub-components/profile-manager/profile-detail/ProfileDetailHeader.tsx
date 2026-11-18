/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Button, Flex, Icon, Stack, Status, Text, Title } from '@drizztdourden08/tessera/primitives';
import { MODE_BADGE_LABELS } from '@app/compounds/ModeBadge';
import { ProfileFolderButton } from './ProfileFolderButton';
import type { ProfileDetailHeaderProps } from './profile-detail.type';

const ProfileDetailHeader = (props: ProfileDetailHeaderProps) => {
  const t = useT();
  const { profile, mode, onOpen, onDelete } = props;

  return (
    <Flex className="profile-detail__header" justify="between" align="start" gap="md" wrap>
      <Stack gap="2xs" className="profile-detail__heading">
        <Flex gap="sm" align="center" wrap>
          <Title level={3}>{profile.name}</Title>
          <Status tone="primary" variant="pill">{MODE_BADGE_LABELS[mode]}</Status>
          {profile.automation && <Status tone="neutral" variant="pill">{t('data-manager:profile-manager.profile-detail-header.agent')}</Status>}
        </Flex>
        <Text variant="caption" tone="muted">{profile.romFile}</Text>
      </Stack>
      <Flex gap="sm" align="center" wrap>
        <Button variant="primary" icon={<Icon name="play" />} onClick={onOpen} disabled={profile.randomizer?.mode === 'archipelia'}>
          {t('data-manager:profile-manager.profile-detail-header.open-profile')}
        </Button>
        <ProfileFolderButton profileId={profile.id} />
        <Button variant="danger" icon={<Icon name="trash-2" />} onClick={onDelete}>{t('data-manager:profile-manager.profile-detail-header.delete')}</Button>
      </Flex>
    </Flex>
  );
};

export { ProfileDetailHeader };
