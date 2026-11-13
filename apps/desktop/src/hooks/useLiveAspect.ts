/* @layer renderer-other @kind hook */
import { useEffect } from 'react';
import { applyLiveAspect } from './apply-live-aspect';
import { LIVE_ASPECT_SETTLE_MS } from './live-aspect.constants';

const useLiveAspect = (): void => {
  useEffect(() => {
    let timer = 0;
    const onChange = (): void => {
      window.clearTimeout(timer);
      timer = window.setTimeout(applyLiveAspect, LIVE_ASPECT_SETTLE_MS);
    };
    window.addEventListener('resize', onChange);
    window.addEventListener('orientationchange', onChange);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', onChange);
      window.removeEventListener('orientationchange', onChange);
    };
  }, []);
};

export { useLiveAspect };
