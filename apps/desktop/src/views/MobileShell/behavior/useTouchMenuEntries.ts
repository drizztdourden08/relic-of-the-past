/* @layer renderer-app @kind hook */
import { useMemo } from 'react';
import type { MenuEntry } from '@drizztdourden08/brock-react';
import { useTouchControlsSettings } from '@app/hooks/useTouchControlsSettings';
import { useTouchControlsStore } from '@app/stores/touch-controls-store';

const useTouchMenuEntries = (): MenuEntry[] => {
  const { touch, updateTouch } = useTouchControlsSettings();
  const setEditing = useTouchControlsStore((s) => s.setEditing);
  const { enabled } = touch;

  return useMemo(() => {
    const toggle: MenuEntry = {
      key: 'touch-toggle',
      label: enabled ? 'Hide touch controls' : 'Show touch controls',
      icon: enabled ? 'eye-off' : 'eye',
      onClick: () => updateTouch({ enabled: !enabled }),
    };
    if (!enabled) return [toggle];
    return [{ key: 'touch-edit', label: 'Edit touch layout', icon: 'pencil', onClick: () => setEditing(true) }, toggle];
  }, [enabled, updateTouch, setEditing]);
};

export { useTouchMenuEntries };
