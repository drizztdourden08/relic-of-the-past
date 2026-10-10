/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import type { LiveHides } from './live-settings.type';

const liveHidesOf = (settings: GameSettings): LiveHides => {
  const enhancedHud = settings.hudMode === 'enhanced';
  return {
    hideSpaceBeyondWalls: !settings.vanillaSafe && Boolean(settings.hideSpaceBeyondWalls),
    hudHidden: enhancedHud && settings.hudEnhancedParts.includes('main'),
    pauseHidden: enhancedHud && settings.hudEnhancedParts.includes('pause'),
  };
};

export { liveHidesOf };
