/* @layer renderer-hud @kind logic */
import { peekInputManager } from '@app/lib/input/input-manager';
import type { DeviceFamily } from '@shared/types/controls';

const declaredDeviceFamily = (): DeviceFamily | null =>
  peekInputManager()?.getProfile()?.deviceFamily ?? null;

export { declaredDeviceFamily };
