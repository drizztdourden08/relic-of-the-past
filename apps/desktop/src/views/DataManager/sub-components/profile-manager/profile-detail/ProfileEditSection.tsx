/* @layer renderer-components @kind component */
import { Card, Stack } from '@drizztdourden08/tessera/primitives';
import { ProfileNameField } from './ProfileNameField';
import { ProfilePackFields } from './ProfilePackFields';
import type { ProfileEditSectionProps } from './profile-detail.type';

const ProfileEditSection = (props: ProfileEditSectionProps) => {
  const { profile, onRefresh } = props;

  return (
    <Card title="Edit" subtitle="These save as you change them." level={4}>
      <Stack gap="md">
        <ProfileNameField profile={profile} onRefresh={onRefresh} />
        <ProfilePackFields {...props} />
      </Stack>
    </Card>
  );
};

export { ProfileEditSection };
