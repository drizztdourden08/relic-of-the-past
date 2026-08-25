/* @layer renderer-components @kind hook */
/**
 * Which ids on a channel the sound chip actually makes a sound for.
 *
 * The list shows every id a channel can carry, because the goal is that nothing in the game is
 * unreachable — the catalogue of named sounds is built by reading the game's own source and it
 * cannot see an id chosen from a table at runtime, so trusting it for completeness would quietly
 * hide sounds. The cost of listing everything is a tail of ids the game never uses, and this is
 * what tells them apart: each is rendered once and asked whether anything came out.
 *
 * Deferred a tick past mount so opening a tab paints first. The scan is a few hundred milliseconds
 * for a whole channel, plus a one-off core load when no game is running — which is also what makes
 * the play buttons on the tab ready by the time anyone reaches for one.
 */
import { useEffect, useState } from 'react';
import { probeAudibleIds } from '@app/lib/game/original-sound';
import type { PreviewTarget } from '@app/lib/game/original-sound';

interface AudibleScan {
  /** Null until the scan has run — rows show no verdict rather than a wrong one. */
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
