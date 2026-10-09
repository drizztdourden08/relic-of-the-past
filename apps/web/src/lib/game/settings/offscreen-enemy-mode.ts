/* @layer bridge-wasm @kind logic */
import type { GameSettings, OffscreenAiMode } from '@shared/types/settings';

const offscreenEnemyMode = (s: GameSettings): OffscreenAiMode => {
  return s.offscreenAI ?? 'idle';
};

export { offscreenEnemyMode };
