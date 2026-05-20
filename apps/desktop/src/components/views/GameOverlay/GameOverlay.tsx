/**
 * GameOverlay — sized to match the game canvas exactly.
 * pointer-events: none so it doesn't interfere with input.
 * Renders the HUD replacement when enhanced mode is active.
 */

import { HudView } from '../../../hud';
import { useHudSettingsStore } from '../../../stores/hud-settings-store';
import '../../../hud/hud.css';

interface GameOverlayProps {
  width: number;
  height: number;
}

function GameOverlay({ width, height }: GameOverlayProps) {
  const { mode, enhancedParts } = useHudSettingsStore();
  const showMainHud = mode === 'enhanced' && enhancedParts.includes('main');

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
      <div style={{ width, height, position: 'relative' }}>
        {showMainHud && <HudView />}
      </div>
    </div>
  );
}

export { GameOverlay };
