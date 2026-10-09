/* @layer renderer-lib @kind types */
interface AllowedDevices {
  keyboard: boolean;
  gamepadKeys: Set<string>;
}

export type { AllowedDevices };
