/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import playIcon from '@iconify-icons/lucide/play';
import { Box, Button } from '@drizztdourden08/tessera/primitives';
import type { ProfileActionsProps } from '../ProfilePage.type';

const ProfileActions = (props: ProfileActionsProps) => {
  const { assetsReady, isGameRunning, onStartGame, onDeleteProfile, onSwitchProfile } = props;

  return (
    <Box className="profile-page__actions">
      <Button
        className="profile-page__action"
        variant="primary"
        size="md"
        onClick={onStartGame}
        disabled={!assetsReady || isGameRunning}
        loading={isGameRunning}
        icon={<IconifyIcon icon={playIcon} />}
      >
        {isGameRunning ? 'Game Running...' : 'Start Game'}
      </Button>
      <Button className="profile-page__action" variant="tertiary" size="md" onClick={onSwitchProfile}>
        Switch Profile
      </Button>
      <Button className="profile-page__action" variant="danger" size="md" onClick={onDeleteProfile}>
        Delete Profile
      </Button>
    </Box>
  );
};

export { ProfileActions };
