/* @layer renderer-app @kind component */
import { useState } from 'react';
import { Box, Button } from '@drizztdourden08/tessera/primitives';
import { useTouchControlsSettings } from '@app/hooks/useTouchControlsSettings';
import { currentBinding } from './behavior/current-binding';
import { swallowNextClick } from './behavior/swallow-next-click';
import { useCommitTouchBinding } from './behavior/useCommitTouchBinding';
import { TouchBindBoard } from './sub-components/TouchBindBoard';
import type { TouchBindPickerProps } from './TouchBindPicker.type';
import './TouchBindPicker.css';

const TouchBindPicker = (props: TouchBindPickerProps) => {
  const { ctx } = props;
  const { touch } = useTouchControlsSettings();
  const [open, setOpen] = useState(false);
  const commit = useCommitTouchBinding(ctx);

  if (ctx.target.type === 'action' && ctx.target.scope === 'global') return null;
  const current = currentBinding(touch.bindings, ctx.target);

  return (
    <Box className="touch-bind-picker">
      {!open && <Button variant="tertiary" onClick={() => setOpen(true)}>Touch here</Button>}
      {open && <TouchBindBoard touch={touch} current={current} onPick={(binding) => { swallowNextClick(); commit(binding); }} />}
      {open && current && <Button variant="tertiary" size="sm" onClick={() => commit(null)}>Default</Button>}
    </Box>
  );
};

export { TouchBindPicker };
