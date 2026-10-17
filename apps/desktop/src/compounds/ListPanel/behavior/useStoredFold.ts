/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import { readFold } from './read-fold';
import { writeFold } from './write-fold';
import type { StoredFold } from '../ListPanel.type';

const useStoredFold = (storageKey: string, defaultCollapsed: boolean): StoredFold => {
  const [collapsed, setCollapsed] = useState(() => readFold(storageKey) ?? defaultCollapsed);

  const apply = useCallback((next: boolean) => {
    setCollapsed(next);
    writeFold(storageKey, next);
  }, [storageKey]);

  const toggle = useCallback(() => apply(!collapsed), [apply, collapsed]);
  const expand = useCallback(() => apply(false), [apply]);

  return { collapsed, toggle, expand };
};

export { useStoredFold };
