/* @layer site-kit @kind hook */
import { useCallback, useSyncExternalStore } from 'react';
import { navigate } from './navigate';
import { NAVIGATE_EVENT } from './useLocation.constants';

const readPath = () => window.location.pathname;

const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange);
  window.addEventListener(NAVIGATE_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(NAVIGATE_EVENT, onChange);
  };
};

const useLocation = () => {
  const path = useSyncExternalStore(subscribe, readPath, readPath);
  const go = useCallback((to: string) => navigate(to), []);
  return { path, navigate: go };
};

export { useLocation };
