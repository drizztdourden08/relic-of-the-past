/* @layer electron-main @kind constants */
import type { DevicePlatform } from '@shared/hub';

const PLATFORM_LABELS: Record<DevicePlatform, string> = {
  windows: 'Windows',
  linux: 'Linux',
  mac: 'macOS',
  android: 'Android',
};

export { PLATFORM_LABELS };
