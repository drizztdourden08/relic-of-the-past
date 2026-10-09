/* @layer renderer-components @kind component */
import { Button, Status, Box, Text } from '@drizztdourden08/tessera/primitives';
import { formatRomName } from '../../../../../utils/formatRomName';
import { formatDate } from './behavior/format-date';
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
              <Status tone="success">✓ Ready</Status>
            ) : (
              <Status tone="danger">✗ Not extracted</Status>
            )}
          </Text>
        </Box>
      </Box>

      <Box className="profile-page__actions">
        <Button
          variant="primary"
          size="md"
          onClick={onStartGame}
          disabled={!assetsReady || isGameRunning}
        >
          {isGameRunning ? '⟳ Game Running...' : '▶ Start Game'}
        </Button>
        <Button variant="tertiary" size="md" onClick={onSwitchProfile}>
          Switch Profile
        </Button>
        <Button variant="danger" size="md" onClick={onDeleteProfile}>
          Delete Profile
        </Button>
      </Box>
    </Box>
  );
};

export { ProfilePage };
