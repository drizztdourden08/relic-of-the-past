/* @layer renderer-hud @kind logic */
import { peekInputManager } from '@app/lib/input/input-manager';
import type { DeviceFamily } from '@rotp/game-data';

const declaredDeviceFamily = (): DeviceFamily | null =>
  peekInputManager()?.getProfile()?.deviceFamily ?? null;

export { declaredDeviceFamily };
