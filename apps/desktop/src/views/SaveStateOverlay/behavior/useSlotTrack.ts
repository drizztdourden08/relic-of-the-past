/* @layer renderer-components @kind hook */
import { useEffect, useRef } from 'react';
import type { SlotTrack, SlotTrackParams } from '../SaveStateOverlay.type';

const useSlotTrack = ({ visible, highlightedSlot }: SlotTrackParams): SlotTrack => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const highlightedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [visible]);

  useEffect(() => {
    const track = trackRef.current;
    const el = highlightedRef.current;
    if (!track || !el) return;
    const trackRect = track.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const delta = (elRect.left + elRect.width / 2) - (trackRect.left + trackRect.width / 2);
    track.scrollTo({ left: track.scrollLeft + delta, behavior: 'smooth' });
  }, [highlightedSlot, visible]);

  return { trackRef, highlightedRef };
};

export { useSlotTrack };
