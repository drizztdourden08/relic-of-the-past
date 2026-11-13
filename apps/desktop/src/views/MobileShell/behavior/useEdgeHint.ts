/* @layer renderer-app @kind hook */
import { useNavigationStore } from '@drizztdourden08/brock-react';
import { useTouchControlsStore } from '@app/stores/touch-controls-store';
import type { EdgeHint } from './edge-hint.type';

const useEdgeHint = (isRunning: boolean, menuOpen: boolean): EdgeHint => {
  const screenOpen = useNavigationStore((s) => s.active !== null);
  const editing = useTouchControlsStore((s) => s.editing);
  return {
    visible: !menuOpen && !editing && (screenOpen || !isRunning),
    startLabel: screenOpen ? 'Back' : 'Home',
  };
};

export { useEdgeHint };
