/* @layer site-kit @kind constants */
import type { DevicePlatform } from '@rotp/hub-contracts';

const PLATFORM_LABELS: Record<DevicePlatform, string> = {
  windows: 'Windows',
  linux: 'Linux',
  mac: 'Mac',
  android: 'Android',
};

export { PLATFORM_LABELS };
