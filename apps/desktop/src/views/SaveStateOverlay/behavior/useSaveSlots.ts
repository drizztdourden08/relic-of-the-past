/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { getActiveProfileId } from '../../../game';
import { ANIM_MS } from '../SaveStateOverlay.constants';
import type { SlotInfo } from '../SaveStateOverlay.type';
import { loadSlotInfos } from './load-slot-infos';

const useSaveSlots = (open: boolean) => {
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState<'in' | 'out' | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const loadSlots = useCallback(async () => {
    const profileId = getActiveProfileId();
    if (!profileId) return;
    setSlots(await loadSlotInfos(profileId));
  }, []);

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    if (open) {
      setVisible(true);
      setAnimating('in');
      void loadSlots();
      timeoutRef.current = setTimeout(() => setAnimating(null), ANIM_MS);
    } else if (visible) {
      setAnimating('out');
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        setAnimating(null);
        setSlots([]);
      }, ANIM_MS);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [open, loadSlots]);

  return { slots, visible, animating, loadSlots };
};

export { useSaveSlots };
