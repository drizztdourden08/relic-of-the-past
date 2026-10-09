/* @layer electron-main @kind constants */
import type { DevicePlatform } from '@shared/hub';

const PLATFORM_LABELS: Record<DevicePlatform, string> = {
  windows: 'Windows',
  linux: 'Linux',
  mac: 'macOS',
  android: 'Android',
};

const PLATFORM_OF_NODE: Partial<Record<NodeJS.Platform, DevicePlatform>> = {
  win32: 'windows',
  darwin: 'mac',
};

export { PLATFORM_LABELS, PLATFORM_OF_NODE };
