/* @layer website-site @kind hook */
import { useSyncExternalStore } from 'react';
import { REDUCED_MOTION_QUERY } from './useReducedMotion.constants';

const subscribe = (notify: () => void): (() => void) => {
  const list = window.matchMedia(REDUCED_MOTION_QUERY);
  list.addEventListener('change', notify);
  return () => list.removeEventListener('change', notify);
};

const snapshot = (): boolean => window.matchMedia(REDUCED_MOTION_QUERY).matches;

const useReducedMotion = (): boolean => useSyncExternalStore(subscribe, snapshot, () => false);

export { useReducedMotion };
