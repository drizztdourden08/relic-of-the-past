/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import { readFold } from './stored-fold/read-fold';
import { writeFold } from './stored-fold/write-fold';
import type { StoredFold } from './stored-fold/stored-fold.type';

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
