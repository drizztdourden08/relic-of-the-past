/* @layer renderer-app @kind logic */
import type { OrientationLayout } from '@rotp/features';
import type { InputBinding } from '@rotp/game-data';
import { touchEmitBinding, touchStickBinding } from '@rotp/input-mapping';
import { DPAD_DIRECTIONS, STICK_DIRECTIONS } from './bind-directions.constants';
import type { BoundControl } from './bound-control.type';

const same = (a: InputBinding, b: InputBinding): boolean => JSON.stringify({ ...a, label: 0 }) === JSON.stringify({ ...b, label: 0 });

const boundControl = (layout: OrientationLayout, current: InputBinding | null): BoundControl => {
  if (!current) return { buttonId: null, movement: false };
  const button = layout.buttons.find((b) => same(touchEmitBinding(b.emit), current));
  const movement = layout.movementType === 'dpad'
    ? DPAD_DIRECTIONS.some((dir) => same(touchEmitBinding(dir), current))
    : STICK_DIRECTIONS.some((dir) => same(touchStickBinding(dir), current));
  return { buttonId: button?.id ?? null, movement };
};

export { boundControl };
