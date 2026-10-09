/* @layer shared-input @kind types */
import type { DeviceOverride, ResolvedControlCategory, SdlGamepadType } from './family.type';

interface OrderedPosition<T extends string> {
  readonly position: T;
  readonly category: ResolvedControlCategory;
}

interface SdlDeviceCapabilities {
  readonly sdlType: SdlGamepadType;
  readonly vendorId?: string;
  readonly productId?: string;
  readonly hasButton: readonly boolean[];
  readonly hasAxis: readonly boolean[];
  readonly buttonLabels: readonly string[];
  readonly overrides?: readonly DeviceOverride[];
}

export type { OrderedPosition, SdlDeviceCapabilities };
