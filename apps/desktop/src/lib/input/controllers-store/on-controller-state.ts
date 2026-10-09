/* @layer renderer-lib @kind logic */
import { getPlatform } from '@app/platform/get-platform';

const onControllerState = (cb: (deviceKey: string, buttons: boolean[], axes: number[]) => void) =>
  getPlatform().controllers.onControllerState(cb);

export { onControllerState };
