/* @layer renderer-app @kind hook */
import { useMemo } from 'react';
import type { MenuEntry } from '@drizztdourden08/brock-react';
import { useTouchControlsStore } from '@app/stores/touch-controls-store';

const useTouchMenuEntries = (): MenuEntry[] => {
  const setEditing = useTouchControlsStore((s) => s.setEditing);

  return useMemo(
    () => [{ key: 'touch-edit', label: 'Edit touch layout', icon: 'pencil', onClick: () => setEditing(true) }],
    [setEditing],
  );
};

export { useTouchMenuEntries };
