/* @layer sanctuary-site @kind hook */
/**
 * The files picked on the Files page. The route names one file (`/files/:id`); a pick of
 * several leaves the route at `/files` and the set lives here. A route change from
 * outside (a deep link, Back) makes the set that one file, or empties a set of one.
 */
import { useCallback, useState } from 'react';
import { navigate } from '../../../router/useLocation';

const FILES_PATH = '/files';

const EMPTY: ReadonlySet<string> = new Set();

const routeOf = (ids: ReadonlySet<string>) => {
  const [only] = ids;
  return ids.size === 1 ? `${FILES_PATH}/${only}` : FILES_PATH;
};

const useFileSelection = (routeId: string | null) => {
  const [ids, setIds] = useState<ReadonlySet<string>>(() => (routeId ? new Set([routeId]) : EMPTY));
  const [seenRoute, setSeenRoute] = useState(routeId);

  // Adjusted during render, the way React derives state from a changed prop.
  if (routeId !== seenRoute) {
    setSeenRoute(routeId);
    if (routeId !== null && !(ids.size === 1 && ids.has(routeId))) setIds(new Set([routeId]));
    if (routeId === null && seenRoute !== null && ids.size === 1 && ids.has(seenRoute)) setIds(EMPTY);
  }

  const change = useCallback((next: ReadonlySet<string>) => {
    setIds(next);
    navigate(routeOf(next), { replace: true });
  }, []);

  const select = useCallback((id: string) => change(new Set([id])), [change]);
  const clear = useCallback(() => change(EMPTY), [change]);

  /** A file that is gone leaves the set; the route is left alone. */
  const forget = useCallback((id: string) => setIds((prev) => {
    if (!prev.has(id)) return prev;
    const next = new Set(prev);
    next.delete(id);
    return next;
  }), []);

  return { ids, change, select, clear, forget };
};

type FileSelection = ReturnType<typeof useFileSelection>;

export { useFileSelection };
export type { FileSelection };
