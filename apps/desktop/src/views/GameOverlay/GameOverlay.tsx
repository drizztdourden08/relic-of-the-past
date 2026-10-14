/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { LocationNotification } from '../LocationNotification';
import { DeliveryQueueIndicator } from '../DeliveryQueueIndicator';
import { DialogView } from '../DialogView';
import { useLocationNotification } from '../../hooks/useLocationNotification';
import { useDialogSettingsStore } from '../../stores/dialog-settings-store';
import { useTitleSettingsStore } from '../../stores/title-settings-store';
import { TitleView } from '../../title';
import { useDeliveryQueueSync } from './behavior/useDeliveryQueueSync';
import { useEnhancedAspectWatch } from './behavior/useEnhancedAspectWatch';
import { useHudRenderable } from './behavior/useHudRenderable';
import { useMenuSlide } from './behavior/useMenuSlide';
import { MainHudLayer } from './sub-components/MainHudLayer';
import { PauseLayer } from './sub-components/PauseLayer';
import type { GameOverlayProps } from './GameOverlay.type';
import './GameOverlay.css';

const GameOverlay = ({ width, height, profileId }: GameOverlayProps) => {
  const hud = useHudRenderable();
  const enhancedDialogBox = useDialogSettingsStore((s) => s.box) === 'enhanced';
  const reimaginedTitle = useTitleSettingsStore((s) => s.screen) === 'reimagined';
  const slide = useMenuSlide(hud.enhancedHudMode && hud.spriteHudRenderable);

  useLocationNotification();
  useEnhancedAspectWatch();
  useDeliveryQueueSync();

  return (
    <Box className="game-overlay" style={{ width, height }}>
      {hud.showPauseMenu && <PauseLayer enhancedRenderable={hud.enhancedRenderable} slide={slide} />}
      {hud.showMainSlot && (
        <MainHudLayer
          spriteHudRenderable={hud.spriteHudRenderable}
          enhancedRenderable={hud.enhancedRenderable}
          slide={slide}
        />
      )}
      {reimaginedTitle && hud.gameMode === 'title' && <TitleView profileId={profileId ?? null} />}
      {enhancedDialogBox && <DialogView />}
      <LocationNotification />
      <DeliveryQueueIndicator />
    </Box>
  );
};

export { GameOverlay };
