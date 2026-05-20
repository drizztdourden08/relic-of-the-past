/**
 * GameOverlay — sized to match the game canvas exactly.
 * pointer-events: none so it doesn't interfere with input.
 * Renders the HUD replacement when enhanced mode is active.
 * Handles the pause menu slide transition (483ms linear, matching vanilla).
 */

import { useEffect, useRef, useState } from 'react';
import { HudView, PauseMenuView } from '../../../hud';
import { LocationNotification } from '../../../hud/composites/LocationNotification';
import { useLocationNotification } from '../../../hud/hooks/useLocationNotification';
import { useHudSettingsStore } from '../../../stores/hud-settings-store';
import { wasmGetMenuState } from '../../../lib/game';
import '../../../hud/hud.css';

interface GameOverlayProps {
  width: number;
  height: number;
}

/** Menu transition: 29 frames at 60fps = 483ms */
const MENU_TRANSITION_MS = 483;

type MenuPhase = 'gameplay' | 'opening' | 'open' | 'closing';

function GameOverlay({ width, height }: GameOverlayProps) {
  const { mode, enhancedParts } = useHudSettingsStore();
  const isEnhanced = mode === 'enhanced';
  const showMainHud = isEnhanced && enhancedParts.includes('main');
  const showPauseMenu = isEnhanced && enhancedParts.includes('pause');
  const [menuPhase, setMenuPhase] = useState<MenuPhase>('gameplay');
  const rafRef = useRef<number>(0);

  // Subscribe to map changes → fire location notifications
  useLocationNotification();

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

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      <div style={{ width, height, position: 'relative', overflow: 'hidden' }}>
        {/* Animation container — always present when enhanced mode is on.
            Two slots stacked vertically (200% height): pause on top, HUD on bottom.
            During gameplay translateY(-50%) shows the bottom (HUD) slot.
            When pause opens, translateY(0) shows the top (pause) slot.
            Slots are always present for stable layout; content is conditional. */}
        {isEnhanced && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              height: '200%',
              transform: isMenuVisible ? 'translateY(0)' : 'translateY(-50%)',
              transition: isTransitioning ? `transform ${MENU_TRANSITION_MS}ms linear` : 'none',
            }}
          >
            {/* Pause menu slot */}
            <div style={{ flex: '0 0 50%', position: 'relative' }}>
              {showPauseMenu && <PauseMenuView />}
            </div>
            {/* HUD slot */}
            <div style={{ flex: '0 0 50%', position: 'relative' }}>
              {showMainHud && <HudView />}
            </div>
          </div>
        )}
        {/* Location change notifications — always rendered when overlay is active */}
        <LocationNotification />
      </div>
    </div>
  );
}

export { GameOverlay };
