/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { useTouchControlsSettings } from '@app/hooks/useTouchControlsSettings';
import { useTouchPadHidden } from '@app/input/touch-pad/useTouchPadHidden';
import { isMobileHost } from '@app/platform/is-mobile-host';
import { PORTRAIT_QUERY } from './useTouchPortrait.constants';

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
