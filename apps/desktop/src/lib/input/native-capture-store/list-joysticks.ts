/* @layer renderer-lib @kind logic */
import type { JoystickInfo } from '@shared/ipc';

const listJoysticks = (): Promise<JoystickInfo[]> => window.api.listJoysticks();

export { listJoysticks };
