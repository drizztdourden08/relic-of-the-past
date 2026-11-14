/* @layer shared-input @kind logic */
import type { InputBinding } from '@rotp/game-data';
import type { StickDirection } from './stick-direction.type';
import { STICK_AXES } from './touch-stick-binding.constants';

const touchStickBinding = (direction: StickDirection): InputBinding => ({
  type: 'gamepad-axis',
  ...STICK_AXES[direction],
});

export { touchStickBinding };
