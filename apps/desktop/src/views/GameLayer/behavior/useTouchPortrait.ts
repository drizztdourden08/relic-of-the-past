/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { useTouchControlsSettings } from '@app/hooks/useTouchControlsSettings';
import { useTouchPadHidden } from '@app/input/touch-pad/useTouchPadHidden';
import { isMobileHost } from '@app/platform/is-mobile-host';

const PORTRAIT_QUERY = '(orientation: portrait)';

/** True when the touch overlay is on and the screen is portrait, so the picture sits at the top and the controls take the space below. */
const useTouchPortrait = (): boolean => {
  const { touch } = useTouchControlsSettings();
  const hiddenByPad = useTouchPadHidden();
  const [portrait, setPortrait] = useState(() => window.matchMedia(PORTRAIT_QUERY).matches);

  useEffect(() => {
    const query = window.matchMedia(PORTRAIT_QUERY);
    const onChange = (): void => setPortrait(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return isMobileHost() && touch.enabled && !hiddenByPad && portrait;
};

export { useTouchPortrait };
