/* @layer renderer-app @kind component */
import { useNavigationStore } from '@drizztdourden08/brock-react';
import { useGameSession } from '@app/hooks/useGameSession';
import { useTouchControlsSettings } from '@app/hooks/useTouchControlsSettings';
import { useInputPaused } from '@app/input/touch-pad/useInputPaused';
import { useTouchProfileActive } from '@app/input/touch-pad/useTouchProfileActive';
import { useTouchControlsStore } from '@app/stores/touch-controls-store';
import { TouchSurface } from './sub-components/TouchSurface';
import './TouchControls.css';

const TouchControls = () => {
  const { touch, updateLayout } = useTouchControlsSettings();
  const { game } = useGameSession();
  const screenOpen = useNavigationStore((s) => s.active !== null);
  const inputPaused = useInputPaused();
  const touchProfileActive = useTouchProfileActive();
  const editing = useTouchControlsStore((s) => s.editing);

  if (!editing && (!game.isRunning || screenOpen || inputPaused || !touchProfileActive)) return null;
  return <TouchSurface touch={touch} updateLayout={updateLayout} />;
};

export { TouchControls };
