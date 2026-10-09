/* @layer renderer-components @kind component */
import { Box, Button, Text } from '@ds/primitives';
import { useAssetsOutOfDate, useGameAssetsStore } from '@app/stores/game-assets-store';
import './StaleGameNotice.css';

const StaleGameNotice = () => {
  const outOfDate = useAssetsOutOfDate();
  const canReload = useGameAssetsStore((state) => state.canReload);
  const profileName = useGameAssetsStore((state) => state.runningProfileName);
  const reload = useGameAssetsStore((state) => state.reload);

  if (!outOfDate || !canReload) return null;

  return (
    <Box className="stale-game-notice" role="alert">
      <Box className="stale-game-notice__body">
        <Text as="span" className="stale-game-notice__title">
          The running game is still on the text it started with
        </Text>
        <Text as="span" variant="caption" className="stale-game-notice__detail">
          {profileName === null
            ? 'Your saved changes are on disk. Reload to play with them.'
            : `Your saved changes are on disk. Reload ${profileName} to play with them.`}
          {' '}Reloading restarts the game, so save your position first.
        </Text>
      </Box>
      <Button size="sm" onClick={reload}>Reload game</Button>
    </Box>
  );
};

export { StaleGameNotice };
