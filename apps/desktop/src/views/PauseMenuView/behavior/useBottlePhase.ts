/* @layer renderer-hud @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { BottlePhase, BottlePhaseState } from '../PauseMenuView.type';

const useBottlePhase = (isBottleSelected: boolean): BottlePhaseState => {
  const [phase, setPhase] = useState<BottlePhase>('hidden');
  const prevBottleRef = useRef(false);

  useEffect(() => {
    if (isBottleSelected && !prevBottleRef.current) {
      setPhase('expanding');
    } else if (!isBottleSelected && prevBottleRef.current) {
      setPhase('collapsing');
    }
    prevBottleRef.current = isBottleSelected;
  }, [isBottleSelected]);

  const onAnimationEnd = useCallback(() => {
    if (phase === 'expanding') setPhase('visible');
    else if (phase === 'collapsing') setPhase('hidden');
  }, [phase]);

  return { phase, showBottlePanel: phase !== 'hidden', showNormalPanels: phase === 'hidden', onAnimationEnd };
};

export { useBottlePhase };
