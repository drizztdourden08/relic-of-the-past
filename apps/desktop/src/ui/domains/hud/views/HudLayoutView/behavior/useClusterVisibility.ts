/* @layer renderer-hud @kind hook */
import { useEffect, useRef, useState } from 'react';
import type { HudClusterReveal } from '@shared/types/hud';
import { REVEAL_MS } from '../HudLayoutView.constants';

const useClusterVisibility = (
  mode: HudClusterReveal | undefined,
  signature: string,
  forceVisible: boolean,
): boolean => {
  const [revealed, setRevealed] = useState(false);
  const seenRef = useRef<string | null>(null);

  useEffect(() => {
    if (seenRef.current === null) {
      seenRef.current = signature;
      return;
    }
    if (seenRef.current === signature) return;
    seenRef.current = signature;
    setRevealed(true);
    const timer = setTimeout(() => setRevealed(false), REVEAL_MS);
    return () => clearTimeout(timer);
  }, [signature]);

  if (forceVisible) return true;
  if (mode === 'never') return false;
  if (mode === 'on-change') return revealed;
  return true;
};

export { useClusterVisibility };
