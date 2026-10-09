/* @layer renderer-components @kind hook */
import { useEffect } from 'react';
import { liveSettingsNow } from '@app/lib/game/live-settings';
import { enhancedAspectAllowed } from '@rotp/game-core';
import { requestEnhancedFallback } from '@rotp/game-core';
import { hostDrawnHud } from '@rotp/features';
import { RESIZE_SETTLE_MS } from '../GameOverlay.constants';

const useEnhancedAspectWatch = (): void => {
  useEffect(() => {
    let timer = 0;

    const check = (): void => {
      const settings = liveSettingsNow();
      if (!settings || !hostDrawnHud(settings.hudStyle)) return;
      if (enhancedAspectAllowed(settings)) return;
      requestEnhancedFallback();
    };

    const onResize = (): void => {
      window.clearTimeout(timer);
      timer = window.setTimeout(check, RESIZE_SETTLE_MS);
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, []);
};

export { useEnhancedAspectWatch };
