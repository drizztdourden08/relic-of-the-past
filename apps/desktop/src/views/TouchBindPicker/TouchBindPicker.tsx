/* @layer renderer-app @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { useTouchControlsSettings } from '@app/hooks/useTouchControlsSettings';
import { getInputManager } from '@app/input/input-manager/get-input-manager';
import { useTouchProfileActive } from '@app/input/touch-pad/useTouchProfileActive';
import { currentBinding } from './behavior/current-binding';
import { useTouchCapture } from './behavior/useTouchCapture';
import { TouchBindBar } from './sub-components/TouchBindBar';
import { TouchBindBoard } from './sub-components/TouchBindBoard';
import type { TouchBindPickerProps } from './TouchBindPicker.type';
import './TouchBindPicker.css';

const TouchBindPicker = (props: TouchBindPickerProps) => {
  const { ctx, actionLabel } = props;
  const { touch } = useTouchControlsSettings();
  const touchProfile = useTouchProfileActive();
  const { pick, restoreDefault } = useTouchCapture(ctx);

  if (!touchProfile) return null;
  const global = ctx.target.type === 'action' && ctx.target.scope === 'global';
  const current = currentBinding(getInputManager().getProfile(), ctx.target);

  return (
    <Box className="touch-bind-picker">
      <TouchBindBoard touch={touch} current={current} onPick={pick} />
      <TouchBindBar actionLabel={actionLabel} onCancel={ctx.close} onDefault={global ? null : restoreDefault} />
    </Box>
  );
};

export { TouchBindPicker };
