/* @layer renderer-hud @kind hook */
/**
 * Keeps a thing mounted through its fade-out. `shown` says whether it should be on screen; the
 * hook answers with whether to render it at all and the opacity to render it at, so a box that just
 * closed stays for the fade with its last content, and a box that just opened fades in from nothing.
 */
import { useEffect, useState } from 'react';

const FADE_MS = 140;

interface FadePresence {
  mounted: boolean;
  opacity: number;
  transition: string;
}

const useFadePresence = (shown: boolean): FadePresence => {
  const [mounted, setMounted] = useState(shown);
  const [opacity, setOpacity] = useState(shown ? 1 : 0);

  useEffect(() => {
    if (shown) {
      setMounted(true);
      // Mount at zero first, then raise it on the next frame so the transition has a start value.
      const raf = requestAnimationFrame(() => setOpacity(1));
      return () => cancelAnimationFrame(raf);
    }
    setOpacity(0);
    const timer = window.setTimeout(() => setMounted(false), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [shown]);

  return { mounted, opacity, transition: `opacity ${FADE_MS}ms ease-out` };
};

export { useFadePresence, FADE_MS };
export type { FadePresence };
