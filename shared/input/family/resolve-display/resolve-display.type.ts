/* @layer shared-input @kind types */
import type { DeviceOverride, FamilyMetadata, SdlGamepadType } from '../family.type';

interface DisplayContext {
  readonly override: DeviceOverride | null;
  readonly family: FamilyMetadata;
  readonly generic: FamilyMetadata;
}

interface DisplayContextParams {
  sdlType: SdlGamepadType;
  vendorId?: string;
  productId?: string;
  overrides?: readonly DeviceOverride[];
}

export type { DisplayContext, DisplayContextParams };
