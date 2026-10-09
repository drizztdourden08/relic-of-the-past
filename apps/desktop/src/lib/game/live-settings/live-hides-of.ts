/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@shared/types/settings';
import type { LiveHides } from './live-settings.type';

const liveHidesOf = (settings: GameSettings): LiveHides => {
  const enhancedHud = settings.hudMode === 'enhanced';
  return {
    hideSpaceBeyondWalls: !settings.vanillaSafe && !!settings.hideSpaceBeyondWalls,
    hudHidden: enhancedHud && settings.hudEnhancedParts.includes('main'),
    pauseHidden: enhancedHud && settings.hudEnhancedParts.includes('pause'),
  };
};

export { liveHidesOf };
