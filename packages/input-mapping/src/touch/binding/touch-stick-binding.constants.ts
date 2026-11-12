/* @layer shared-input @kind constants */
import type { StickDirection } from './stick-direction.type';
import type { StickAxis } from './touch-stick-binding.type';

const STICK_AXES: Readonly<Record<StickDirection, StickAxis>> = {
  up: { axisIndex: 1, direction: '-', label: 'Touch stick up' },
  down: { axisIndex: 1, direction: '+', label: 'Touch stick down' },
  left: { axisIndex: 0, direction: '-', label: 'Touch stick left' },
  right: { axisIndex: 0, direction: '+', label: 'Touch stick right' },
};

export { STICK_AXES };
