/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Card, Stack } from '@drizztdourden08/tessera/primitives';
import { ProfileNameField } from './ProfileNameField';
import { ProfilePackFields } from './ProfilePackFields';
import type { ProfileEditSectionProps } from './profile-detail.type';

const ProfileEditSection = (props: ProfileEditSectionProps) => {
  const t = useT();
  const { profile, onRefresh } = props;

  return (
    <Card title={t('data-manager:profile-manager.profile-edit-section.edit')} level={4}>
      <Stack gap="md">
        <ProfileNameField profile={profile} onRefresh={onRefresh} />
        <ProfilePackFields {...props} />
      </Stack>
    </Card>
  );
};

export { ProfileEditSection };
