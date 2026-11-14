/* @layer renderer-app @kind hook */
import { useNavigationStore } from '@drizztdourden08/brock-react';
import { useTouchControlsStore } from '@app/stores/touch-controls-store';

const useEdgeHint = (isRunning: boolean, menuOpen: boolean): boolean => {
  const screenOpen = useNavigationStore((s) => s.active !== null);
  const editing = useTouchControlsStore((s) => s.editing);
  return !isRunning && !screenOpen && !menuOpen && !editing;
};

export { useEdgeHint };
