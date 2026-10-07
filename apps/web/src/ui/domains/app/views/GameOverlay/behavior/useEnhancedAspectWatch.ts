/* @layer renderer-components @kind hook */
/**
 * The other half of the host-drawn styles' 16:9 rule (Enhanced and Modern): the
 * window itself getting narrower.
 *
 * The settings screen already drops the style when a setting narrows the ratio,
 * but with `aspectRatio: 'auto'` the ratio is measured from the live viewport,
 * so a player who merely drags the window in has changed nothing settings can
 * see, and would keep a clipped app-drawn HUD until their next settings change.
 * This watches from a component that is actually mounted during gameplay and
 * asks for the same drop, with the same notice, through the same request.
 *
 * Debounced because a drag fires this continuously and the check reads layout;
 * the threshold itself is never re-derived here. `enhancedAspectAllowed` is the
 * one place that knows it.
 */
import { useEffect } from 'react';
import { liveSettingsNow } from '@app/lib/game/live-settings';
import { enhancedAspectAllowed } from '@app/lib/game/settings';
import { requestEnhancedFallback } from '@app/lib/game/enhanced-fallback';
import { hostDrawnHud } from '@shared/features/hud-style';

/** Long enough to sit out a drag, short enough that a resize feels answered. */
const RESIZE_SETTLE_MS = 250;

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

export { useEnhancedAspectWatch, RESIZE_SETTLE_MS };
