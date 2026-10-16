/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { CYCLE_MS } from '../RecordingPreview.constants';

const useCyclingFrame = (frameUrls: string[]): string | null => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    if (frameUrls.length < 2) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % frameUrls.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [frameUrls]);

  return frameUrls[index] ?? null;
};

export { useCyclingFrame };
