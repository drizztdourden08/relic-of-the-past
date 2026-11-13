/* @layer renderer-app @kind component */
import { useNavigationStore } from '@drizztdourden08/brock-react';
import { useGameSession } from '@app/hooks/useGameSession';
import { useTouchControlsSettings } from '@app/hooks/useTouchControlsSettings';
import { useInputPaused } from '@app/input/touch-pad/useInputPaused';
import { useTouchPadHidden } from '@app/input/touch-pad/useTouchPadHidden';
import { TouchSurface } from './sub-components/TouchSurface';
import './TouchControls.css';

const TouchControls = () => {
  const { touch, updateLayout } = useTouchControlsSettings();
  const hiddenByPad = useTouchPadHidden();
  const { game } = useGameSession();
  const screenOpen = useNavigationStore((s) => s.active !== null);
  const inputPaused = useInputPaused();

  if (!touch.enabled || hiddenByPad || !game.isRunning || screenOpen || inputPaused) return null;
  return <TouchSurface touch={touch} updateLayout={updateLayout} />;
};

export { TouchControls };
