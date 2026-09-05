/* @layer renderer-components @kind component */
// Sized to the game canvas, pointer-events: none. Pause menu slide is 483ms linear, matching vanilla.

import { useEffect, useRef, useState } from 'react';
import { Box } from '../../../../design-system/primitives/Box';
import { HudView, PauseMenuView } from '../../../hud';
import { LocationNotification } from '../../../hud/views/LocationNotification';
import { DeliveryQueueIndicator } from '../../../hud/views/DeliveryQueueIndicator';
import { HudUnavailableNotice } from '../../../hud/views/HudUnavailableNotice';
import { useLocationNotification } from '../../../hud/hooks/useLocationNotification';
import { isMainHudVisibleForMode } from '../../../hud/hud-visibility';
import { useHudSettingsStore } from '../../../../../stores/hud-settings-store';
import { useGameUIStore } from '../../../../../stores/game-ui-store';
import { useSpriteAvailabilityStore } from '../../../../../stores/sprite-availability-store';
import { useDeliveryQueueStore } from '../../../../../stores/delivery-queue-store';
import { wasmGetMenuState, deliveryQueue } from '../../../../../lib/game';
import '../../../hud/hud.css';

interface GameOverlayProps {
  width: number;
  height: number;
}

/** Menu transition: 29 frames at 60fps = 483ms */
const MENU_TRANSITION_MS = 483;

type MenuPhase = 'gameplay' | 'opening' | 'open' | 'closing';

const GameOverlay = ({ width, height }: GameOverlayProps) => {
  const { mode: hudMode, style: hudStyle, enhancedParts } = useHudSettingsStore();
  const gameMode = useGameUIStore((s) => s.mode);
  const spritesAvailable = useSpriteAvailabilityStore((s) => s.available);
  const isEnhanced = hudMode === 'enhanced';

  // The sprite HUD can only render when the Vanilla style is paired with
  // extracted sprites for the active ROM; otherwise we show an HTML notice.
  const spriteHudRenderable = hudStyle === 'vanilla' && spritesAvailable;
  // Gated on the live game mode: gameplay and dialogue only (see hud-visibility).
  const showMainSlot = isEnhanced && enhancedParts.includes('main') && isMainHudVisibleForMode(gameMode);
  const showPauseMenu = isEnhanced && enhancedParts.includes('pause') && spriteHudRenderable;
  const [menuPhase, setMenuPhase] = useState<MenuPhase>('gameplay');
  const rafRef = useRef<number>(0);

  useLocationNotification();

  useEffect(() => {
    const unsub = deliveryQueue.subscribe(useDeliveryQueueStore.getState()._sync);
    return unsub;
  }, []);

  // Poll WASM menu state each frame while enhanced mode is on.
  useEffect(() => {
    if (!isEnhanced) return;
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
  }, [isEnhanced]);

  const isMenuVisible = menuPhase === 'opening' || menuPhase === 'open';
  const isTransitioning = menuPhase === 'opening' || menuPhase === 'closing';
  const transition = isTransitioning ? `transform ${MENU_TRANSITION_MS}ms linear` : 'none';

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
      {/* Pause menu slides down from above. */}
      {showPauseMenu && (
        <PauseMenuView
          slideTransform={isMenuVisible ? 'translateY(0)' : 'translateY(-100%)'}
          slideTransition={transition}
        />
      )}
      {/* HUD slides down when the menu opens. Falls back to an HTML notice when the
          sprite HUD can't render (Modern style, or Vanilla without sprites). */}
      {showMainSlot && (
        spriteHudRenderable ? (
          <HudView
            slideTransform={isMenuVisible ? 'translateY(100%)' : 'translateY(0)'}
            slideTransition={transition}
          />
        ) : (
          <HudUnavailableNotice reason={hudStyle === 'modern' ? 'modern' : 'no-sprites'} />
        )
      )}
      {/* Location change notifications */}
      <LocationNotification />
      {/* Delivery queue indicator (bottom-right) */}
      <DeliveryQueueIndicator />
    </Box>
  );
};

export { GameOverlay };
