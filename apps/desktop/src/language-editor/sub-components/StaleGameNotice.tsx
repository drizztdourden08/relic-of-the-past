/* @layer renderer-components @kind component */
import { Box, Button, Text } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import { useAssetsOutOfDate, useGameAssetsStore } from '@app/stores/game-assets-store';
import './StaleGameNotice.css';

const StaleGameNotice = () => {
  const t = useT();
  const outOfDate = useAssetsOutOfDate();
  const canReload = useGameAssetsStore((state) => state.canReload);
  const profileName = useGameAssetsStore((state) => state.runningProfileName);
  const reload = useGameAssetsStore((state) => state.reload);

  if (!outOfDate || !canReload) return null;

  return (
    <Box className="stale-game-notice" role="alert">
      <Box className="stale-game-notice__body">
        <Text as="span" className="stale-game-notice__title">
          {t('language-editor:stale-game.title')}
        </Text>
        <Text as="span" variant="caption" className="stale-game-notice__detail">
          {profileName === null
            ? t('language-editor:stale-game.detail')
            : t('language-editor:stale-game.detail-profile', { profile: profileName })}
        </Text>
      </Box>
      <Button size="sm" onClick={reload}>{t('language-editor:stale-game.reload')}</Button>
    </Box>
  );
};

export { StaleGameNotice };
