/* @layer renderer-components @kind logic */
import { resolveLiveControlState } from '@rotp/input-mapping';
import type { ControllerInputState, ResolvedControl } from '@rotp/input-mapping';
import type { PositionIcons } from '@app/input/pad-overlay/pad-overlay.type';
import type { PressedModel } from './pressed-items.type';

const isButtonLike = (control: ResolvedControl): boolean => control.kind === 'button' || control.category === 'trigger';

const buttonModelOf = (controls: readonly ResolvedControl[], state: ControllerInputState, icons: PositionIcons): PressedModel => {
  const buttons = controls.filter(isButtonLike);
  return {
    items: buttons.map((control) => {
      const icon = icons[control.position];
      return { id: control.position, label: control.label, ...(icon ? { icon } : {}) };
    }),
    pressed: buttons
      .filter((control) => resolveLiveControlState(control, state.buttons, state.axes).pressed)
      .map((control) => control.position),
  };
};

export { buttonModelOf };
