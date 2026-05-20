/**
 * GameOverlay — sized to match the game canvas exactly.
 * pointer-events: none so it doesn't interfere with input.
 * Renders the HUD replacement when enhanced mode is active.
 * Handles the pause menu slide transition (483ms linear, matching vanilla).
 */

import { useEffect, useRef, useState } from 'react';
import { HudView } from '../../../hud';
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
  const showMainHud = mode === 'enhanced' && enhancedParts.includes('main');
  const [menuPhase, setMenuPhase] = useState<MenuPhase>('gameplay');
  const rafRef = useRef<number>(0);

  // Poll WASM menu state each frame
  useEffect(() => {
    if (!showMainHud) return;
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
  }, [showMainHud]);

  // Determine slide position: 0% = HUD visible, -100% = menu visible
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
        {showMainHud && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              height: '200%',
              transform: isMenuVisible ? 'translateY(-50%)' : 'translateY(0)',
              transition: isTransitioning ? `transform ${MENU_TRANSITION_MS}ms linear` : 'none',
            }}
          >
            {/* Pause menu placeholder — sits above (first in flow = top half) */}
            <div style={{ flex: '0 0 50%', position: 'relative' }}>
              {/* TODO: Enhanced pause menu content goes here */}
            </div>
            {/* Enhanced HUD — bottom half (visible during gameplay) */}
            <div style={{ flex: '0 0 50%', position: 'relative' }}>
              <HudView />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { GameOverlay };
