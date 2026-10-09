/* @layer renderer-widgets @kind hook */
import { useCallback, useEffect, useState } from 'react';
import { cheatCapacityLadder, cheatCapacityRung, cheatSetCapacityRung } from '@app/game';
import type { CapacityKind, CapacityRung } from '@app/game';
import { getActiveCapacity, subscribeActiveCapacity } from '@rotp/randomizer';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { reachableRungsOf } from './reachable-rungs';
import { CAPACITY_RECHECK_MS } from '../CheatsWidget.constants';
import type { CapacityLadder } from '../CheatsWidget.type';

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
    const timer = setInterval(refresh, CAPACITY_RECHECK_MS);
    const unsubscribe = subscribeActiveCapacity(refresh);
    return () => { clearInterval(timer); unsubscribe(); };
  }, [refresh, mode]);

  const set = useCallback((next: number) => {
    const offered = readLadder(kind);
    if (!offered.some((r) => r.rung === next)) return;
    cheatSetCapacityRung(kind, next);
    refresh();
  }, [kind, refresh]);

  const cap = ladder.find((r) => r.rung === rung)?.cap ?? -1;
  return { ladder, rung, cap, settable: ladder.length > 1, seeded, set };
};

export { useCapacityLadder };
