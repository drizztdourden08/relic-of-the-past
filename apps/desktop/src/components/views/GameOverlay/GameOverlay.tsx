/**
 * GameOverlay — positioned absolutely over the game canvas.
 * pointer-events: none so it doesn't interfere with input.
 * Renders the DebugStateDisplay for data sync verification.
 */

import { DebugStateDisplay } from './DebugStateDisplay';

function GameOverlay() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      <DebugStateDisplay />
    </div>
  );
}

export { GameOverlay };
