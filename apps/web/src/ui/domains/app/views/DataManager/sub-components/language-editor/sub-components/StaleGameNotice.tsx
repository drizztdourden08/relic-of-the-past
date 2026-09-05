/* @layer renderer-components @kind component */
/**
 * The running game is playing older text than the set on screen.
 *
 * Text reaches the emulator once, when a profile is loaded and the game boots
 * with the assets as they were on disk. Nothing re-reads them afterwards, not a
 * save and not a save state, so an edit saved mid-session is real, baked, and
 * invisible until the profile is loaded again. Without this notice that reads
 * as the edit having done nothing, which is exactly how it was first hit.
 *
 * Reloading reboots the core, so the warning says so plainly instead of
 * leaving it to be discovered: the button is a shortcut, not a surprise.
 */
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
