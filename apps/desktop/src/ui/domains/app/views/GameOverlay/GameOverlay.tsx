/* @layer renderer-components @kind component */
import { useEffect, useRef, useState } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { EnhancedPauseView, HudLayoutView, HudView, PauseMenuView } from '../../../hud';
import { LocationNotification } from '../../../hud/views/LocationNotification';
import { DeliveryQueueIndicator } from '../../../hud/views/DeliveryQueueIndicator';
import { HudUnavailableNotice } from '../../../hud/views/HudUnavailableNotice';
import { DialogView } from '../../../hud/views/DialogView';
import { useLocationNotification } from '../../../hud/hooks/useLocationNotification';
import { isMainHudVisibleForMode } from '../../../hud/hud-visibility';
import { useEnhancedAspectWatch } from './behavior/useEnhancedAspectWatch';
import { hostDrawnHud } from '@rotp/features';
import { useHudSettingsStore } from '../../../../../stores/hud-settings-store';
import { useDialogSettingsStore } from '../../../../../stores/dialog-settings-store';
import { useTitleSettingsStore } from '../../../../../stores/title-settings-store';
import { TitleView } from '../../../title';
import { useGameUIStore } from '../../../../../stores/game-ui-store';
import { usePauseMenuStore } from '../../../../../stores/pause-menu-store';
import { useSpriteAvailabilityStore } from '../../../../../stores/sprite-availability-store';
import { useDeliveryQueueStore } from '../../../../../stores/delivery-queue-store';
import { wasmGetMenuState, deliveryQueue } from '../../../../../lib/game';
import { MENU_TRANSITION_MS } from './GameOverlay.constants';
import type { GameOverlayProps, MenuPhase } from './GameOverlay.type';
import '../../../hud/hud.css';

const GameOverlay = ({ width, height, profileId }: GameOverlayProps) => {
  const { mode: hudMode, style: hudStyle, enhancedParts } = useHudSettingsStore();
  const gameMode = useGameUIStore((s) => s.mode);
  const spritesAvailable = useSpriteAvailabilityStore((s) => s.available);
  const enhancedDialogBox = useDialogSettingsStore((s) => s.box) === 'enhanced';
  const reimaginedTitle = useTitleSettingsStore((s) => s.screen) === 'reimagined';
  const enhancedHudMode = hudMode === 'enhanced';

  const spriteHudRenderable = hudStyle === 'vanilla' && spritesAvailable;
  const enhancedRenderable = hostDrawnHud(hudStyle) && spritesAvailable;
  const showMainSlot = enhancedHudMode && enhancedParts.includes('main') && isMainHudVisibleForMode(gameMode);
  const showPauseMenu = enhancedHudMode && enhancedParts.includes('pause') && (spriteHudRenderable || enhancedRenderable);
  const [menuPhase, setMenuPhase] = useState<MenuPhase>('gameplay');
  const rafRef = useRef<number>(0);
  const pauseBrowsing = usePauseMenuStore((s) => s.state.phase === 'browsing');
  const hostMenuHolding = useGameUIStore((s) => s.hostMenu.holding);
  const enhancedMenuOpen = pauseBrowsing && hostMenuHolding;

  useLocationNotification();

  useEnhancedAspectWatch();

  useEffect(() => {
    const unsub = deliveryQueue.subscribe(useDeliveryQueueStore.getState()._sync);
    return unsub;
  }, []);

  useEffect(() => {
    if (!enhancedHudMode || !spriteHudRenderable) return;
    const poll = () => {
      const state = wasmGetMenuState();
      const phase: MenuPhase =
        state === 1 ? 'opening' :
        state === 2 ? 'open' :
        state === 3 ? 'closing' :
        'gameplay';
      setMenuPhase((prev) => prev !== phase ? phase : prev);
      rafRef.current = requestAnimationFrame(poll);
    };
    rafRef.current = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enhancedHudMode, spriteHudRenderable]);

  const isMenuVisible = menuPhase === 'opening' || menuPhase === 'open';
  const isTransitioning = menuPhase === 'opening' || menuPhase === 'closing';
  const transition = isTransitioning ? `transform ${MENU_TRANSITION_MS}ms linear` : 'none';
  const enhancedTransform = enhancedMenuOpen ? 'translateY(0)' : 'translateY(-100%)';
  const enhancedTransition = `transform ${MENU_TRANSITION_MS}ms linear`;

  return (
    <Box
      className="game-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        width,
        height,
        margin: 'auto',
        pointerEvents: 'none',
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      {showPauseMenu && (
        enhancedRenderable ? (
          <EnhancedPauseView
            slideTransform={enhancedTransform}
            slideTransition={enhancedTransition}
          />
        ) : (
          <PauseMenuView
            slideTransform={isMenuVisible ? 'translateY(0)' : 'translateY(-100%)'}
            slideTransition={transition}
          />
        )
      )}
      {showMainSlot && (
        spriteHudRenderable ? (
          <HudView
            slideTransform={isMenuVisible ? 'translateY(100%)' : 'translateY(0)'}
            slideTransition={transition}
          />
        ) : enhancedRenderable ? (
          <HudLayoutView />
        ) : (
          <HudUnavailableNotice />
        )
      )}
      {reimaginedTitle && gameMode === 'title' && <TitleView profileId={profileId ?? null} />}
      {enhancedDialogBox && <DialogView />}
      <LocationNotification />
      <DeliveryQueueIndicator />
    </Box>
  );
};

export { GameOverlay };
