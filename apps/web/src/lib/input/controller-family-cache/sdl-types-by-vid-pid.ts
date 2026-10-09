/* @layer renderer-lib @kind logic */
import type { ControllerGamepadType } from '@shared/ipc';

const hex4 = (value: number): string => value.toString(16).padStart(4, '0');

const byVidPid = new Map<string, ControllerGamepadType>();

const sdlTypesByVidPid = {
  keyOf: (vendorId: number, productId: number): string => `${hex4(vendorId)}:${hex4(productId)}`,
  map: byVidPid,
};

export { sdlTypesByVidPid };
