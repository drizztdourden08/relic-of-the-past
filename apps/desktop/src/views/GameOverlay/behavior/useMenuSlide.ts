/* @layer renderer-components @kind hook */
import { useEffect, useRef, useState } from 'react';
import { wasmGetMenuState } from '../../../game';
import { MENU_PHASE_OF_STATE, MENU_TRANSITION_MS } from '../GameOverlay.constants';
import type { MenuPhase, MenuSlide } from '../GameOverlay.type';

const useMenuSlide = (polling: boolean): MenuSlide => {
  const [menuPhase, setMenuPhase] = useState<MenuPhase>('gameplay');
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!polling) return;
    const poll = () => {
      const phase = MENU_PHASE_OF_STATE[wasmGetMenuState()] ?? 'gameplay';
      setMenuPhase((prev) => (prev !== phase ? phase : prev));
      rafRef.current = requestAnimationFrame(poll);
    };
    rafRef.current = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafRef.current);
  }, [polling]);

  const transitioning = menuPhase === 'opening' || menuPhase === 'closing';
  return {
    menuVisible: menuPhase === 'opening' || menuPhase === 'open',
    transition: transitioning ? `transform ${MENU_TRANSITION_MS}ms linear` : 'none',
  };
};

export { useMenuSlide };
