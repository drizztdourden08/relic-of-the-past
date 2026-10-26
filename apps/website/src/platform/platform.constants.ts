/* @layer website-site @kind constants */
import type { Platform } from './platform.type';

const PLATFORM_LABELS: Record<Platform, string> = {
  windows: 'Windows',
  mac: 'macOS',
  linux: 'Linux',
  unknown: 'your platform',
};

const PLATFORM_HINTS: ReadonlyArray<readonly [Platform, readonly string[]]> = [
  ['windows', ['win']],
  ['mac', ['mac']],
  ['linux', ['linux', 'x11']],
];

export { PLATFORM_HINTS, PLATFORM_LABELS };
