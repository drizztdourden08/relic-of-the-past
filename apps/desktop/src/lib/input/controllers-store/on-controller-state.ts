/* @layer renderer-lib @kind logic */
import { controllerHostPort } from '@app/platform/controller-host-port';

const onControllerState = (cb: (deviceKey: string, buttons: boolean[], axes: number[]) => void) =>
  controllerHostPort().onControllerState(cb);

export { onControllerState };
