/* @layer renderer-hud @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import './HudUnavailableNotice.css';

const HudUnavailableNotice = () => {
  const t = useT();
  return (
    <Box className="hud-unavailable">
      <Box className="hud-unavailable__box">
        <Text variant="label">{t('views-game-layer:hudUnavailable.headline')}</Text>
        <Text variant="caption" tone="dim">{t('views-game-layer:hudUnavailable.caption')}</Text>
      </Box>
    </Box>
  );
};

export { HudUnavailableNotice };
