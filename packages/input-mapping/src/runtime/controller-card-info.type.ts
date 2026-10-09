/* @layer renderer-lib @kind types */
import type { DeviceFamily } from '@rotp/game-data';

interface ControllerCardInfo {
  vendorId: string;
  productId: string;
  deviceFamily: DeviceFamily;
  displayName: string;
  sdlType: string | null;
}

export type { ControllerCardInfo };
