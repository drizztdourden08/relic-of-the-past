/* @layer renderer-hud @kind hook */
/**
 * Whether the button cluster is on screen right now.
 *
 * 'on-change' is the interesting mode and the reason this is a hook instead of
 * a boolean: the cluster is a reminder, not a readout, so it earns its space
 * only in the moment something about it changed. That is when an assignment moved or a
 * different pad was picked up. It shows itself, then gets out of the way.
 *
 * The very first signature is NOT a change. Fading the cluster in on every mount
 * would make loading a save, opening the pause menu, or resizing the window all
 * look like the player had just re-bound something.
 */
import { useEffect, useRef, useState } from 'react';
import type { HudClusterReveal } from '@shared/types/hud';

/** How long a change keeps the cluster up. Long enough to read four chips,
 *  short enough that it is gone before the next room. */
const REVEAL_MS = 2000;

const useClusterVisibility = (
  /** The document's own rule; a document that states none means 'always'. */
  mode: HudClusterReveal | undefined,
  signature: string,
  forceVisible: boolean,
): boolean => {
  const [revealed, setRevealed] = useState(false);
  const seenRef = useRef<string | null>(null);

  useEffect(() => {
    if (seenRef.current === null) {
      seenRef.current = signature;   // mount is not a change
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

export { useClusterVisibility, REVEAL_MS };
