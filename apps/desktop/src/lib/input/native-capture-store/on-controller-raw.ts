/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
import type { ControllerRawReport } from '@shared/ipc';

const onControllerRaw = (cb: (report: ControllerRawReport) => void): (() => void) =>
  appApi().onControllerRaw(cb);

export { onControllerRaw };
