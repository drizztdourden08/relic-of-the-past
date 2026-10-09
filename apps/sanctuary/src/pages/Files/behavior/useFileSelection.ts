/* @layer sanctuary-site @kind hook */
import { useCallback, useState } from 'react';
import { navigate } from '@rotp/design';
import { FILES_PATH, NO_IDS } from './useFileSelection.constants';

const routeOf = (ids: ReadonlySet<string>) => {
  const [only] = ids;
  return ids.size === 1 ? `${FILES_PATH}/${only}` : FILES_PATH;
};

const useFileSelection = (routeId: string | null) => {
  const [ids, setIds] = useState<ReadonlySet<string>>(() => (routeId ? new Set([routeId]) : NO_IDS));
  const [seenRoute, setSeenRoute] = useState(routeId);

  const routeChangedSinceLastRender = routeId !== seenRoute;
  if (routeChangedSinceLastRender) {
    setSeenRoute(routeId);
    if (routeId !== null && !(ids.size === 1 && ids.has(routeId))) setIds(new Set([routeId]));
    if (routeId === null && seenRoute !== null && ids.size === 1 && ids.has(seenRoute)) setIds(NO_IDS);
  }

  const change = useCallback((next: ReadonlySet<string>) => {
    setIds(next);
    navigate(routeOf(next), { replace: true });
  }, []);

  const select = useCallback((id: string) => change(new Set([id])), [change]);
  const clear = useCallback(() => change(NO_IDS), [change]);

  const forget = useCallback((id: string) => setIds((prev) => {
    if (!prev.has(id)) return prev;
    const next = new Set(prev);
    next.delete(id);
    return next;
  }), []);

  return { ids, change, select, clear, forget };
};

export { useFileSelection };
