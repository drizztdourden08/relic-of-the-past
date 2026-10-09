/* @layer bridge-wasm @kind logic */
import type { GameSettings, OffscreenEnemyMode } from '@shared/types/settings';

const offscreenEnemyMode = (s: GameSettings): OffscreenEnemyMode => {
  return s.offscreenAI ?? 'idle';
};

export { offscreenEnemyMode };
