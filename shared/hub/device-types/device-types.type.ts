/* @layer shared-hub @kind types */
import type { DEVICE_PLATFORMS } from './device-types.constants';

type DevicePlatform = (typeof DEVICE_PLATFORMS)[number];

type Device = {
  id: string;
  userId: string;
  tokenHash: string;
  label: string;
  platform: DevicePlatform;
  createdAt: number;
  lastSeenAt: number;
  revokedAt: number | null;
};

export type { DevicePlatform, Device };
