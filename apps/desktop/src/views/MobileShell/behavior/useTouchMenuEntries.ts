/* @layer renderer-app @kind hook */
import { useMemo } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import type { MenuEntry } from '@drizztdourden08/brock-react';
import { useTouchControlsStore } from '@app/stores/touch-controls-store';

const useTouchMenuEntries = (): MenuEntry[] => {
  const t = useT();
  const setEditing = useTouchControlsStore((s) => s.setEditing);

  return useMemo(
    () => [{ key: 'touch-edit', label: t('views-mobile-shell:menu.touchEdit'), icon: 'pencil', onClick: () => setEditing(true) }],
    [setEditing, t],
  );
};

export { useTouchMenuEntries };
