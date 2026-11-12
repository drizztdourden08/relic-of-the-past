/* @layer renderer-app @kind logic */
import type { OrientationLayout, TouchEmit } from '@rotp/features';
import { buildPadState, movementRadiusPx, readDpad, readStick } from '@rotp/input-mapping';
import type { PadState, ScreenBox } from '@rotp/input-mapping';
import { IDLE_VIEW } from '../TouchControls.constants';
import type { TouchSession, TouchViewState } from '../TouchControls.type';

interface Derived {
  view: TouchViewState;
  pad: PadState;
}

const DIRECTIONS = ['up', 'down', 'left', 'right'] as const;

/**
 * Turns the fingers on the overlay into what to draw and the pad to publish.
 * A leashed stick drags its base along, so the movement session's base is updated here.
 */
const deriveTouchState = (sessions: ReadonlyMap<number, TouchSession>, layout: OrientationLayout, box: ScreenBox): Derived => {
  const pressed = new Set<string>();
  const emits = new Set<TouchEmit>();
  let stickAxes: [number, number] | null = null;
  let view: TouchViewState = IDLE_VIEW;

  for (const session of sessions.values()) {
    if (session.kind === 'button' && session.buttonId !== null) {
      const button = layout.buttons.find((b) => b.id === session.buttonId);
      if (button) {
        pressed.add(button.id);
        emits.add(button.emit);
      }
    }
    if (session.kind !== 'movement') continue;
    const radius = movementRadiusPx(layout, box);
    if (layout.movementType === 'dpad') {
      const dpad = readDpad(session.point, session.base, radius);
      DIRECTIONS.forEach((dir) => { if (dpad[dir]) emits.add(dir); });
      view = { ...view, dpad };
      continue;
    }
    const { deadZone } = layout.movements[layout.movementType];
    const reading = readStick({ base: session.base, thumb: session.point }, radius, deadZone, layout.movementType === 'dynamic-stick');
    session.base = reading.base;
    stickAxes = reading.axes;
    const knob = { x: reading.base.x + reading.axes[0] * radius, y: reading.base.y + reading.axes[1] * radius };
    view = { ...view, stick: { base: reading.base, knob } };
  }

  return { view: { ...view, pressed }, pad: buildPadState(emits, stickAxes) };
};

export { deriveTouchState };
