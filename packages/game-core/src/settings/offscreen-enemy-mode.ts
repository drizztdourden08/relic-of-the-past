/* @layer bridge-wasm @kind logic */
import type { GameSettings, OffscreenEnemyMode } from '@rotp/features';

const offscreenEnemyMode = (s: GameSettings): OffscreenEnemyMode => {
  return s.offscreenAI ?? 'idle';
};

export { offscreenEnemyMode };
