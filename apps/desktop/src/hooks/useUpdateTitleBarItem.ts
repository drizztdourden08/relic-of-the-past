/* @layer renderer-app @kind hook */
import type { TitleBarItemSpec } from '@drizztdourden08/brock-react';
import { useUpdaterUiStore } from '@app/stores/updater-ui-store';

const useUpdateTitleBarItem = (): TitleBarItemSpec | null => {
  const available = useUpdaterUiStore((s) => s.available);
  const setDialogOpen = useUpdaterUiStore((s) => s.setDialogOpen);
  if (!available) return null;
  return { kind: 'status', label: 'Update available', icon: 'download', status: 'Update available', tone: 'info', onSelect: () => setDialogOpen(true) };
};

export { useUpdateTitleBarItem };
