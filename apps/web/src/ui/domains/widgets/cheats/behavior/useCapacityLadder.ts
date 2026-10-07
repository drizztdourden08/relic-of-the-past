/* @layer renderer-widgets @kind hook */
/**
 * The ladder a capacity family offers, and the rung it stands on. The core reports every rung
 * its gates allow; a running seed narrows that to the rungs its plan can reach, from the start
 * rung logic assumes up to the max the settings chose (reachable-rungs.ts). The core has no
 * event for a profile change, so the ladder is re-read on the store's mode changes, on a slow
 * tick, when a session arms or disarms, and right after a write through `set`.
 */
import { useCallback, useEffect, useState } from 'react';
import { cheatCapacityLadder, cheatCapacityRung, cheatSetCapacityRung } from '@app/lib/game';
import type { CapacityKind, CapacityRung } from '@app/lib/game';
import { getActiveCapacity, subscribeActiveCapacity } from '@app/lib/game/randomizer-client/active-capacity-profile';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { reachableRungsOf } from './reachable-rungs';

const RECHECK_MS = 750;

type CapacityLadder = {
  ladder: CapacityRung[];
  rung: number;
  /** The cap read on the current rung, or -1 when the ladder is empty. */
  cap: number;
  /** Whether the console can move this family at all: more than one rung on offer. */
  settable: boolean;
  /** Whether a seed narrowed the ladder to what its plan reaches. */
  seeded: boolean;
  set: (rung: number) => void;
};

const sameLadder = (a: CapacityRung[], b: CapacityRung[]): boolean =>
  a.length === b.length && a.every((r, i) => r.rung === b[i].rung && r.cap === b[i].cap);

const readLadder = (kind: CapacityKind): CapacityRung[] => {
  const all = cheatCapacityLadder(kind);
  const reachable = reachableRungsOf(kind, getActiveCapacity());
  return reachable ? all.filter((r) => reachable.has(r.rung)) : all;
};

const useCapacityLadder = (kind: CapacityKind): CapacityLadder => {
  const mode = useGameUIStore((s) => s.mode);
  const [ladder, setLadder] = useState<CapacityRung[]>([]);
  const [rung, setRung] = useState(-1);
  const [seeded, setSeeded] = useState(() => getActiveCapacity() !== null);

  const refresh = useCallback(() => {
    const next = readLadder(kind);
    setLadder((prev) => (sameLadder(prev, next) ? prev : next));
    setRung(cheatCapacityRung(kind));
    setSeeded(getActiveCapacity() !== null);
  }, [kind]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, RECHECK_MS);
    const unsubscribe = subscribeActiveCapacity(refresh);
    return () => { clearInterval(timer); unsubscribe(); };
  }, [refresh, mode]);

  const set = useCallback((next: number) => {
    // Only a rung the ladder offers is written, so a seed's floor holds whatever the caller asks.
    const offered = readLadder(kind);
    if (!offered.some((r) => r.rung === next)) return;
    cheatSetCapacityRung(kind, next);
    refresh();
  }, [kind, refresh]);

  const cap = ladder.find((r) => r.rung === rung)?.cap ?? -1;
  return { ladder, rung, cap, settable: ladder.length > 1, seeded, set };
};

export { useCapacityLadder };
export type { CapacityLadder };
