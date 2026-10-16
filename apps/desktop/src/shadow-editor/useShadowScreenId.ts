/* @layer renderer-app @kind hook */
import { overworldScreenIdOf, wasmGetViewportInfo } from '@app/game';
import { useGameUIStore } from '@app/stores/game-ui-store';

const useShadowScreenId = (): number => {
  useGameUIStore((s) => s.map.overworldScreenIndex);
  const vp = wasmGetViewportInfo();
  return vp ? overworldScreenIdOf(vp) : 0;
};

export { useShadowScreenId };
