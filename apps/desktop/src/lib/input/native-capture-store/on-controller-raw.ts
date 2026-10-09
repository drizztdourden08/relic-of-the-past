/* @layer renderer-lib @kind logic */
import type { ControllerRawReport } from '@shared/ipc';

const onControllerRaw = (cb: (report: ControllerRawReport) => void): (() => void) =>
  window.api.onControllerRaw(cb);

export { onControllerRaw };
