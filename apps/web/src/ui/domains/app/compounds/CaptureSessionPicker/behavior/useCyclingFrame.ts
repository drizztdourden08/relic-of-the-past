/* @layer renderer-components @kind hook */
/** Advances through a session's packaged frames on a timer, so the no-ffmpeg PNG fallback
 *  reads as a (fake) video instead of freezing on the first frame. Purely a UI timer over
 *  props data - no store, no IPC - so it stays a compound-level hook, same as SaveSlot's
 *  own useArmedAction. */
import { useEffect, useState } from 'react';

const CYCLE_MS = 500;

const useCyclingFrame = (frameUrls: string[]): string | null => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    if (frameUrls.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % frameUrls.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [frameUrls]);

  return frameUrls[index] ?? null;
};

export { useCyclingFrame };
