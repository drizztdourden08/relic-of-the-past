/**
 * GameOverlay — sized to match the game canvas exactly.
 * pointer-events: none so it doesn't interfere with input.
 * Renders the HUD replacement when enhanced mode is active.
 * Handles the pause menu slide transition (483ms linear, matching vanilla).
 *
 * Hierarchy: OverlayRoot > (PauseMenuView | HudView | LocationNotification)
 * Each view is absolutely positioned and uses translateY for the slide animation.
 */

import { useEffect, useRef, useState } from 'react';
import { HudView, PauseMenuView } from '../../../hud';
import { LocationNotification } from '../../../hud/composites/LocationNotification';
import { DeliveryQueueIndicator } from '../../../hud/composites/DeliveryQueueIndicator';
import { useLocationNotification } from '../../../hud/hooks/useLocationNotification';
import { useHudSettingsStore } from '../../../stores/hud-settings-store';
import { useDeliveryQueueStore } from '../../../stores/delivery-queue-store';
import { wasmGetMenuState, deliveryQueue } from '../../../lib/game';
import '../../../hud/hud.css';

interface GameOverlayProps {
  width: number;
  height: number;
}

/** Menu transition: 29 frames at 60fps = 483ms */
const MENU_TRANSITION_MS = 483;

type MenuPhase = 'gameplay' | 'opening' | 'open' | 'closing';

const GameOverlay = ({ width, height }: GameOverlayProps) => {
  const { mode, enhancedParts } = useHudSettingsStore();
  const isEnhanced = mode === 'enhanced';
  const showMainHud = isEnhanced && enhancedParts.includes('main');
  const showPauseMenu = isEnhanced && enhancedParts.includes('pause');
  const [menuPhase, setMenuPhase] = useState<MenuPhase>('gameplay');
  const rafRef = useRef<number>(0);

  // Subscribe to map changes → fire location notifications
  useLocationNotification();

  // Subscribe delivery queue → zustand store sync
  useEffect(() => {
    const unsub = deliveryQueue.subscribe(useDeliveryQueueStore.getState()._sync);
    return unsub;
  }, []);

  // Poll WASM menu state each frame — active whenever enhanced mode is on
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

  // Determine slide position
  const isMenuVisible = menuPhase === 'opening' || menuPhase === 'open';
  const isTransitioning = menuPhase === 'opening' || menuPhase === 'closing';
  const transition = isTransitioning ? `transform ${MENU_TRANSITION_MS}ms linear` : 'none';

  return (
    <div
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
      {/* Pause menu — slides down from above */}
      {showPauseMenu && (
        <PauseMenuView
          slideTransform={isMenuVisible ? 'translateY(0)' : 'translateY(-100%)'}
          slideTransition={transition}
        />
      )}
      {/* HUD — slides down when menu opens */}
      {showMainHud && (
        <HudView
          slideTransform={isMenuVisible ? 'translateY(100%)' : 'translateY(0)'}
          slideTransition={transition}
        />
      )}
      {/* Location change notifications */}
      <LocationNotification />
      {/* Delivery queue indicator (bottom-right) */}
      <DeliveryQueueIndicator />
    </div>
  );
};

export { GameOverlay };
