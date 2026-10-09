/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
const onHoldChanged = (callback: (held: boolean) => void): (() => void) =>
  appApi().onControllerHoldChanged(callback);

export { onHoldChanged };
