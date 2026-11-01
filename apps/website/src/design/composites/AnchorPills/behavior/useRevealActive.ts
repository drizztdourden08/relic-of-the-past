/* @layer website-site @kind hook */
import { useEffect, useRef } from 'react';

const useRevealActive = (activeId: string) => {
  const trackRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const pill = track?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!track || !pill) return;
    track.scrollTo({ left: pill.offsetLeft - (track.clientWidth - pill.offsetWidth) / 2 });
  }, [activeId]);

  return trackRef;
};

export { useRevealActive };
