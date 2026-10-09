/* @layer renderer-hud @kind hook */
import { useEffect, useState } from 'react';
import { REDUCED_MOTION_QUERY } from './HudNodeMotion.constants';

const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(() => (
    typeof window === 'undefined' ? false : window.matchMedia(REDUCED_MOTION_QUERY).matches
  ));

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = (): void => setReduced(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
};

export { useReducedMotion };
