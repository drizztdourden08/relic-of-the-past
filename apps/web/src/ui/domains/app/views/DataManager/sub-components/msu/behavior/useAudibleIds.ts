/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { probeAudibleIds } from '@app/lib/game/original-sound';
import type { PreviewTarget } from '@app/lib/game/original-sound';
import type { AudibleScan } from './useAudibleIds.type';

const useAudibleIds = (target: PreviewTarget, ids: number[]): AudibleScan => {
  const [audible, setAudible] = useState<Set<number> | null>(null);
  const span = `${ids.length}:${ids[0]}:${ids[ids.length - 1]}`;

  useEffect(() => {
    setAudible(null);
    let cancelled = false;
    const handle = setTimeout(() => {
      void probeAudibleIds(target, ids).then((found) => {
        if (!cancelled) setAudible(found.size > 0 ? found : null);
      });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [target, span]);

  return { audible };
};

export { useAudibleIds };
