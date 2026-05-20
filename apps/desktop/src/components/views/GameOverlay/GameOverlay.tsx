/**
 * GameOverlay — sized to match the game canvas exactly.
 * pointer-events: none so it doesn't interfere with input.
 * Renders the HUD replacement.
 */

import { HudView } from '../../../hud';
import '../../../hud/hud.css';

interface GameOverlayProps {
  width: number;
  height: number;
}

function GameOverlay({ width, height }: GameOverlayProps) {
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
        <HudView />
      </div>
    </div>
  );
}

export { GameOverlay };
