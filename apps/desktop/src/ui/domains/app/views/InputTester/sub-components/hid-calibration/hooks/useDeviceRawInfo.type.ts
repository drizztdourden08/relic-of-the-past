/* @layer renderer-components @kind types */
import type { ControllerBusType } from '@drizztdourden08/brock-input';

interface RawHidInfo {
  path: string | null;
  manufacturer: string | null;
  product: string | null;
  serialNumber: string | null;
  busType: ControllerBusType | null;
}

export type { RawHidInfo };
