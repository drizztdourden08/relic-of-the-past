/* @layer renderer-hud @kind hook */
import { useEffect, useState } from 'react';
import { FADE_MS } from '../DialogView.constants';
import type { FadePresence } from '../DialogView.type';

const useFadePresence = (shown: boolean, fadeMs: number = FADE_MS): FadePresence => {
  const [mounted, setMounted] = useState(shown);
  const [opacity, setOpacity] = useState(shown ? 1 : 0);

  useEffect(() => {
    if (shown) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setOpacity(1));
      return () => cancelAnimationFrame(raf);
    }
    setOpacity(0);
    const timer = window.setTimeout(() => setMounted(false), fadeMs);
    return () => window.clearTimeout(timer);
  }, [shown, fadeMs]);

  return { mounted, opacity, transition: `opacity ${fadeMs}ms ease-out` };
};

export { useFadePresence };
