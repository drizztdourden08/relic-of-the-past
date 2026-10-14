/* @layer renderer-components @kind component */
import { Status, Box, Text } from '@drizztdourden08/tessera/primitives';
import { formatRomName } from '../../format/format-rom-name';
import { ProfileActions } from './sub-components/ProfileActions';
import { ProfileDetails } from './sub-components/ProfileDetails';
import './ProfilePage.css';
import type { ProfilePageProps } from './ProfilePage.type';

const ProfilePage = (props: ProfilePageProps) => {
  const {
    profile,
    romStatus,
    isGameRunning,
    onStartGame,
    onDeleteProfile,
    onSwitchProfile,
  } = props;
  const assetsReady = romStatus?.extractionStatus === 'ready';

  return (
    <Box className="profile-page">
      <Box className="profile-page__header">
        <Text as="h2" className="profile-page__name">
          {profile.name}
          {profile.automation && <Status tone="neutral">Agent</Status>}
        </Text>
        <Text className="profile-page__rom">{formatRomName(profile.romFile)}</Text>
      </Box>

      <ProfileDetails profile={profile} assetsReady={assetsReady} />

      <ProfileActions
        assetsReady={assetsReady}
        isGameRunning={isGameRunning}
        onStartGame={onStartGame}
        onDeleteProfile={onDeleteProfile}
        onSwitchProfile={onSwitchProfile}
      />
    </Box>
  );
};

export { ProfilePage };
