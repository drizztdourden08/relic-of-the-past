/* @layer sanctuary-site @kind hook */
/**
 * The history router. One hook reads the current pathname and re-renders on back,
 * forward and on `navigate`, which pushes a new entry and tells every subscriber.
 */
import { useCallback, useSyncExternalStore } from 'react';

const NAVIGATE_EVENT = 'sanctuary:navigate';

const readPath = () => window.location.pathname;

const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange);
  window.addEventListener(NAVIGATE_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(NAVIGATE_EVENT, onChange);
  };
};

const navigate = (path: string, options: { replace?: boolean } = {}) => {
  if (options.replace) window.history.replaceState(null, '', path);
  else window.history.pushState(null, '', path);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
};

const useLocation = () => {
  const path = useSyncExternalStore(subscribe, readPath, readPath);
  const go = useCallback((to: string) => navigate(to), []);
  return { path, navigate: go };
};

export { useLocation, navigate };
