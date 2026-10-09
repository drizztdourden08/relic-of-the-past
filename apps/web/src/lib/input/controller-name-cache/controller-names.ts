/* @layer renderer-lib @kind logic */
const hex4 = (value: number): string => value.toString(16).padStart(4, '0');

const controllerNames = {
  byDeviceKey: new Map<string, string>(),
  byVidPid: new Map<string, string>(),
  vidPidKey: (vendorId: number, productId: number): string => `${hex4(vendorId)}:${hex4(productId)}`,
};

export { controllerNames };
