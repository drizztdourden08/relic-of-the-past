/* @layer renderer-widgets @kind hook */
/**
 * The widget's pinned-header preference, read live so the settings popover and
 * the tracker below it never disagree. Same localStorage-plus-storage-event
 * shape the inventory widget's view mode uses.
 */
import { useState, useEffect } from 'react';
import { STICKY_HEADER_KEY } from '../checks.constants';

const readSticky = (): boolean => localStorage.getItem(STICKY_HEADER_KEY) !== 'off';

const useStickyHeader = () => {
  const [sticky, setSticky] = useState<boolean>(readSticky);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STICKY_HEADER_KEY) setSticky(readSticky());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return sticky;
};

export { readSticky, useStickyHeader };
