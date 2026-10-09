/* @layer renderer-hud @kind logic */
import { peekInputManager } from '@app/input/input-manager/peek-input-manager';
import type { DeviceFamily } from '@rotp/game-data';

const declaredDeviceFamily = (): DeviceFamily | null =>
  peekInputManager()?.getProfile()?.deviceFamily ?? null;

export { declaredDeviceFamily };
