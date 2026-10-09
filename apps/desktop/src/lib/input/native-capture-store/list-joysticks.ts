/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
import type { JoystickInfo } from '@shared/ipc';

const listJoysticks = (): Promise<JoystickInfo[]> => appApi().listJoysticks();

export { listJoysticks };
