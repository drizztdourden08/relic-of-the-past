/* @layer renderer-lib @kind types */
import type { InputBinding } from '@shared/types/controls';

interface RawInputEvent {
  binding: InputBinding;
  sourceDeviceKey: string;
  vendorId: string | null;
  productId: string | null;
}

type RawInputListener = (event: RawInputEvent) => void;

type AxisDirection = '+' | '-' | null;

export type { RawInputEvent, RawInputListener, AxisDirection };
