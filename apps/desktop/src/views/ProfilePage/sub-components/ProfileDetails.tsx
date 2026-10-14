/* @layer renderer-components @kind component */
import { Box, Icon, Status, Text } from '@drizztdourden08/tessera/primitives';
import { formatDate } from '../behavior/format-date';
import type { ProfileDetailsProps } from '../ProfilePage.type';

const ProfileDetails = ({ profile, assetsReady }: ProfileDetailsProps) => (
  <Box className="profile-page__details">
    <Box className="profile-page__row">
      <Text className="profile-page__label">ROM File</Text>
      <Text className="profile-page__value">{profile.romFile}</Text>
    </Box>
    <Box className="profile-page__row">
      <Text className="profile-page__label">Created</Text>
      <Text className="profile-page__value">{formatDate(profile.created)}</Text>
    </Box>
    <Box className="profile-page__row">
      <Text className="profile-page__label">Last Played</Text>
      <Text className="profile-page__value">{formatDate(profile.lastPlayed)}</Text>
    </Box>
    <Box className="profile-page__row">
      <Text className="profile-page__label">Assets</Text>
      <Text className="profile-page__value">
        {assetsReady ? (
          <Status tone="success"><Icon name="check" size={12} aria-hidden /> Ready</Status>
        ) : (
          <Status tone="danger"><Icon name="x" size={12} aria-hidden /> Not extracted</Status>
        )}
      </Text>
    </Box>
  </Box>
);

export { ProfileDetails };
