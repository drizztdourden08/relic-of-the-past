/* @layer renderer-components @kind component */
import { Button, Flex, Icon, Stack, Status, Text, Title } from '@drizztdourden08/tessera/primitives';
import { MODE_BADGE_LABELS } from '@app/compounds/ModeBadge';
import { ProfileFolderButton } from './ProfileFolderButton';
import type { ProfileDetailHeaderProps } from './profile-detail.type';

const ProfileDetailHeader = (props: ProfileDetailHeaderProps) => {
  const { profile, mode, onOpen, onDelete } = props;

  return (
    <Flex className="profile-detail__header" justify="between" align="start" gap="md" wrap>
      <Stack gap="2xs" className="profile-detail__heading">
        <Flex gap="sm" align="center" wrap>
          <Title level={3}>{profile.name}</Title>
          <Status tone="primary" variant="pill">{MODE_BADGE_LABELS[mode]}</Status>
          {profile.automation && <Status tone="neutral" variant="pill">Agent</Status>}
        </Flex>
        <Text variant="caption" tone="muted">{profile.romFile}</Text>
      </Stack>
      <Flex gap="sm" align="center" wrap>
        <Button variant="primary" icon={<Icon name="play" />} onClick={onOpen}>Open profile</Button>
        <ProfileFolderButton profileId={profile.id} />
        <Button variant="danger" icon={<Icon name="trash-2" />} onClick={onDelete}>Delete</Button>
      </Flex>
    </Flex>
  );
};

export { ProfileDetailHeader };
