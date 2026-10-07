/* @layer renderer-components @kind hook */
/**
 * Which ids on a channel the sound chip makes a sound for. The list shows every id (the catalogue
 * cannot see ids picked from a table at runtime), so each is rendered once to tell the dead tail
 * apart. Deferred a tick past mount so the tab paints first; the scan also warms the core load.
 */
import { useEffect, useState } from 'react';
import { probeAudibleIds } from '@app/lib/game/original-sound';
import type { PreviewTarget } from '@app/lib/game/original-sound';

interface AudibleScan {
  /** Null until the scan has run; rows show no verdict instead of a wrong one. */
  audible: Set<number> | null;
}

const useAudibleIds = (target: PreviewTarget, ids: number[]): AudibleScan => {
  const [audible, setAudible] = useState<Set<number> | null>(null);
  // Ids are a stable range per channel; keying on the ends avoids re-scanning on every render.
  const span = `${ids.length}:${ids[0]}:${ids[ids.length - 1]}`;

  useEffect(() => {
    setAudible(null);
    let cancelled = false;
    const handle = setTimeout(() => {
      void probeAudibleIds(target, ids).then((found) => {
        // An empty result means the core could not render, which is not the same as "all silent".
        if (!cancelled) setAudible(found.size > 0 ? found : null);
      });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
    // `span` stands in for `ids` by value: the array is rebuilt every render but its contents are
    // a fixed range per channel, so depending on it directly would rescan continuously.
  }, [target, span]);

  return { audible };
};

export { useAudibleIds };
export type { AudibleScan };
